(function () {
  const TPP = (window.TPP = window.TPP || {});
  const d64 = (TPP.d64 = TPP.d64 || {});
  const DEFAULT_IMAGE_NAME = "disk";
  const DEFAULT_TRACK_COUNT = 35;
  const DEFAULT_HAS_ERROR_INFO = false;
  const MAX_TRACK_COUNT = 42;
  const SECTOR_SIZE = 256;
  const REL_MAX_RECORD_LENGTH = 254;
  const REL_DATA_SECTORS_PER_SIDE_SECTOR = 120;
  const REL_MAX_SIDE_SECTORS = 6;
  const DIRECTORY_TRACK = 18;
  const BAM_SECTOR = 0;
  const DIRECTORY_START_SECTOR = 1;

  d64.fileTypes = Object.freeze({
    del: 0x80,
    seq: 0x81,
    prg: 0x82,
    usr: 0x83,
    rel: 0x84,
  });

  d64.diskFormats = Object.freeze({
    d64_35_track: "d64_35_track",
    d64_35_track_error_info: "d64_35_track_error_info",
    d64_40_track: "d64_40_track",
    d64_40_track_error_info: "d64_40_track_error_info",
    d64_42_track: "d64_42_track",
    d64_42_track_error_info: "d64_42_track_error_info",
  });

  d64.errorCodes = Object.freeze({
    ok: 0x01,
  });

  d64.dosVersions = Object.freeze({
    dos2_6: 0x41,
  });

  d64.dosTypes = Object.freeze({
    dos2a: "2A",
  });

  d64.directoryEntryFlags = Object.freeze({
    closed: 0x80,
    locked: 0x40,
  });

  d64.headerOffsets = Object.freeze({
    nextDirectoryTrack: 0x00,
    nextDirectorySector: 0x01,
    dosVersion: 0x02,
    bamStart: 0x04,
    diskNameStart: 0x90,
    diskNameLength: 0x10,
    diskIdStart: 0xa2,
    diskIdLength: 0x02,
    dosTypeStart: 0xa5,
    dosTypeLength: 0x02,
  });

  d64.trackSectorCount = function (track) {
    if (track >= 1 && track <= 17) return 21;
    if (track >= 18 && track <= 24) return 19;
    if (track >= 25 && track <= 30) return 18;
    if (track >= 31 && track <= 42) return 17;
    return 0;
  };

  d64.normalizeTrackCount = function (trackCount) {
    const value = Math.round(Number(trackCount) || 0);
    if (value >= 42) return 42;
    if (value >= 40) return 40;
    return DEFAULT_TRACK_COUNT;
  };

  d64.totalSectorCount = function (trackCount) {
    const maxTrack = d64.normalizeTrackCount(trackCount);
    let total = 0;
    for (let track = 1; track <= maxTrack; track += 1) {
      total += d64.trackSectorCount(track);
    }
    return total;
  };

  d64.dataSizeForTrackCount = function (trackCount) {
    return d64.totalSectorCount(trackCount) * SECTOR_SIZE;
  };

  d64.errorInfoSizeForTrackCount = function (trackCount) {
    return d64.totalSectorCount(trackCount);
  };

  d64.imageSizeForGeometry = function (trackCount, hasErrorInfo) {
    const normalizedTrackCount = d64.normalizeTrackCount(trackCount);
    return (
      d64.dataSizeForTrackCount(normalizedTrackCount) +
      (hasErrorInfo ? d64.errorInfoSizeForTrackCount(normalizedTrackCount) : 0)
    );
  };

  d64.formatForGeometry = function (trackCount, hasErrorInfo) {
    const normalizedTrackCount = d64.normalizeTrackCount(trackCount);
    if (normalizedTrackCount === 42) {
      return hasErrorInfo
        ? d64.diskFormats.d64_42_track_error_info
        : d64.diskFormats.d64_42_track;
    }
    if (normalizedTrackCount === 40) {
      return hasErrorInfo
        ? d64.diskFormats.d64_40_track_error_info
        : d64.diskFormats.d64_40_track;
    }
    return hasErrorInfo
      ? d64.diskFormats.d64_35_track_error_info
      : d64.diskFormats.d64_35_track;
  };

  d64.describeGeometry = function (source) {
    let trackCount = DEFAULT_TRACK_COUNT;
    let hasErrorInfo = DEFAULT_HAS_ERROR_INFO;
    if (typeof source === "string") {
      const format = String(source || "").trim();
      if (
        format === d64.diskFormats.d64_42_track ||
        format === d64.diskFormats.d64_42_track_error_info
      ) {
        trackCount = 42;
      } else if (
        format === d64.diskFormats.d64_40_track ||
        format === d64.diskFormats.d64_40_track_error_info
      ) {
        trackCount = 40;
      } else {
        trackCount = 35;
      }
      hasErrorInfo = /error_info$/.test(format);
    } else if (
      source instanceof Uint8Array ||
      source instanceof ArrayBuffer ||
      Array.isArray(source) ||
      (source &&
        typeof source.length === "number" &&
        typeof source !== "function")
    ) {
      const length =
        source instanceof ArrayBuffer
          ? source.byteLength
          : Math.max(0, Math.floor(Number(source.length) || 0));
      const knownFormats = [
        { trackCount: 35, hasErrorInfo: false },
        { trackCount: 35, hasErrorInfo: true },
        { trackCount: 40, hasErrorInfo: false },
        { trackCount: 40, hasErrorInfo: true },
        { trackCount: 42, hasErrorInfo: false },
        { trackCount: 42, hasErrorInfo: true },
      ];
      const known = knownFormats.find(function (candidate) {
        return (
          d64.imageSizeForGeometry(
            candidate.trackCount,
            candidate.hasErrorInfo,
          ) === length
        );
      });
      if (known) {
        trackCount = known.trackCount;
        hasErrorInfo = known.hasErrorInfo;
      }
    } else if (source && typeof source === "object") {
      if (Object.prototype.hasOwnProperty.call(source, "format")) {
        const fromFormat = d64.describeGeometry(String(source.format || ""));
        trackCount = fromFormat.trackCount;
        hasErrorInfo = fromFormat.hasErrorInfo;
      }
      if (Object.prototype.hasOwnProperty.call(source, "trackCount")) {
        trackCount = d64.normalizeTrackCount(source.trackCount);
      }
      if (Object.prototype.hasOwnProperty.call(source, "hasErrorInfo")) {
        hasErrorInfo = Boolean(source.hasErrorInfo);
      } else if (Object.prototype.hasOwnProperty.call(source, "errorInfo")) {
        hasErrorInfo = true;
      }
    }
    const normalizedTrackCount = d64.normalizeTrackCount(trackCount);
    return {
      format: d64.formatForGeometry(normalizedTrackCount, hasErrorInfo),
      trackCount: normalizedTrackCount,
      hasErrorInfo: hasErrorInfo,
      sectorCount: d64.totalSectorCount(normalizedTrackCount),
      dataSize: d64.dataSizeForTrackCount(normalizedTrackCount),
      errorInfoSize: hasErrorInfo
        ? d64.errorInfoSizeForTrackCount(normalizedTrackCount)
        : 0,
      imageSize: d64.imageSizeForGeometry(normalizedTrackCount, hasErrorInfo),
      errorInfoOffset: d64.dataSizeForTrackCount(normalizedTrackCount),
    };
  };

  d64.detectFormat = function (imageOrLength) {
    return d64.describeGeometry(imageOrLength).format;
  };

  d64.trackOffset = function (track, sector) {
    let offset = 0;
    for (let t = 1; t < track; t += 1) {
      offset += SECTOR_SIZE * d64.trackSectorCount(t);
    }
    return offset + SECTOR_SIZE * sector;
  };

  d64.sectorIndex = function (track, sector, source) {
    const geometry = d64.describeGeometry(source);
    const normalizedTrack = Math.max(1, Math.floor(Number(track) || 0));
    const normalizedSector = Math.max(0, Math.floor(Number(sector) || 0));
    if (normalizedTrack > geometry.trackCount) return -1;
    if (normalizedSector >= d64.trackSectorCount(normalizedTrack)) return -1;
    let index = 0;
    for (
      let currentTrack = 1;
      currentTrack < normalizedTrack;
      currentTrack += 1
    ) {
      index += d64.trackSectorCount(currentTrack);
    }
    return index + normalizedSector;
  };

  d64.readSector = function (image, track, sector) {
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    const offset = d64.trackOffset(track, sector);
    return bytes.subarray(offset, offset + 256);
  };

  d64.encodeFileName = function (name, maxLength) {
    const result = new Uint8Array(maxLength || 16).fill(0xa0);
    const value = d64.normalizeFileName(name, maxLength || 16);
    let index = 0;
    for (let i = 0; i < value.length && index < result.length; i += 1) {
      const ch = value[i];
      const code = value.charCodeAt(i);
      if ((code >= 65 && code <= 90) || (code >= 48 && code <= 57)) {
        result[index++] = code;
      } else if (ch === ".") {
        result[index++] = 0x2e;
      } else if (code === 32) {
        result[index++] = 0xa0;
      } else {
        result[index++] = code;
      }
    }
    return result;
  };

  d64.normalizeFileName = function (name, maxLength, options) {
    const limit = Math.max(1, Math.floor(Number(maxLength) || 16));
    const config = options || {};
    const value = String(name || "").toUpperCase();
    const normalized = value.replace(/[^A-Z0-9 ._-]+/g, "");
    const trimmed = config.trim === false ? normalized : normalized.trim();
    return trimmed.slice(0, limit);
  };

  d64.decodeName = function (bytes) {
    const data =
      bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const chars = [];
    for (let index = 0; index < data.length; index += 1) {
      const value = data[index];
      if (value === 0x00) break;
      if (value === 0xa0) {
        chars.push(" ");
        continue;
      }
      chars.push(String.fromCharCode(value & 0xff));
    }
    return chars.join("").trimEnd();
  };

  d64.normalizeDiskId = function (diskId) {
    return (
      d64.decodeName(d64.encodeFileName(String(diskId || "TP"), 2)) || "TP"
    );
  };

  d64.normalizeDosType = function (dosType) {
    const value = String(dosType || d64.dosTypes.dos2a)
      .trim()
      .toUpperCase();
    return value || d64.dosTypes.dos2a;
  };

  d64.normalizeDosVersion = function (dosVersion) {
    if (typeof dosVersion === "number" && Number.isFinite(dosVersion)) {
      return Math.max(0, Math.min(255, Math.round(dosVersion)));
    }
    const key = String(dosVersion || "")
      .trim()
      .toLowerCase();
    if (Object.prototype.hasOwnProperty.call(d64.dosVersions, key)) {
      return d64.dosVersions[key];
    }
    return d64.dosVersions.dos2_6;
  };

  d64.normalizeDiskInfo = function (options) {
    const config = options || {};
    const geometry = d64.describeGeometry(config);
    return {
      diskName:
        String(
          config.diskName ||
            config.name ||
            config.title ||
            config.baseName ||
            DEFAULT_IMAGE_NAME,
        ).trim() || DEFAULT_IMAGE_NAME,
      diskId: d64.normalizeDiskId(config.diskId),
      dosType: d64.normalizeDosType(config.dosType),
      dosVersion: d64.normalizeDosVersion(config.dosVersion),
      format: geometry.format,
      trackCount: geometry.trackCount,
      hasErrorInfo: geometry.hasErrorInfo,
      errorInfo:
        config.errorInfo instanceof Uint8Array
          ? config.errorInfo
          : config.errorInfo
            ? new Uint8Array(config.errorInfo)
            : undefined,
    };
  };

  d64.normalizeFileType = function (type) {
    if (typeof type === "number" && Number.isFinite(type)) {
      return Math.max(0, Math.min(255, Math.round(type)));
    }
    const key = String(type || "")
      .trim()
      .toLowerCase();
    if (Object.prototype.hasOwnProperty.call(d64.fileTypes, key)) {
      return d64.fileTypes[key];
    }
    return d64.fileTypes.seq;
  };

  d64.encodeDirectoryEntryType = function (type, options) {
    const config = options || {};
    const baseCode = d64.normalizeFileType(type) & 0x07;
    let typeByte = baseCode;
    if (config.closed !== false) {
      typeByte |= d64.directoryEntryFlags.closed;
    }
    if (Boolean(config.locked)) {
      typeByte |= d64.directoryEntryFlags.locked;
    }
    return typeByte & 0xff;
  };

  d64.normalizeRecordLength = function (length) {
    return Math.max(
      1,
      Math.min(REL_MAX_RECORD_LENGTH, Math.round(Number(length) || 0) || 1),
    );
  };

  d64.normalizeUnusedTailData = function (unusedTailData, expectedLength) {
    const length = Math.max(0, Math.floor(Number(expectedLength) || 0));
    const source =
      unusedTailData instanceof Uint8Array
        ? unusedTailData
        : new Uint8Array(unusedTailData || []);
    const result = new Uint8Array(length);
    result.set(source.subarray(0, length));
    return result;
  };

  d64.readHeader = function (image) {
    const geometry = d64.describeGeometry(image);
    const sector = d64.readSector(image, DIRECTORY_TRACK, BAM_SECTOR);
    const offsets = d64.headerOffsets;
    return {
      format: geometry.format,
      imageSize: geometry.imageSize,
      dataSize: geometry.dataSize,
      trackCount: geometry.trackCount,
      sectorCount: geometry.sectorCount,
      hasErrorInfo: geometry.hasErrorInfo,
      errorInfoOffset: geometry.errorInfoOffset,
      errorInfoSize: geometry.errorInfoSize,
      track: DIRECTORY_TRACK,
      sector: BAM_SECTOR,
      nextDirectoryTrack: sector[offsets.nextDirectoryTrack],
      nextDirectorySector: sector[offsets.nextDirectorySector],
      dosVersionByte: sector[offsets.dosVersion],
      dosVersionName:
        sector[offsets.dosVersion] === d64.dosVersions.dos2_6
          ? "dos2_6"
          : "unknown",
      diskName: d64.decodeName(
        sector.subarray(
          offsets.diskNameStart,
          offsets.diskNameStart + offsets.diskNameLength,
        ),
      ),
      diskId: d64.decodeName(
        sector.subarray(
          offsets.diskIdStart,
          offsets.diskIdStart + offsets.diskIdLength,
        ),
      ),
      dosType: d64.decodeName(
        sector.subarray(
          offsets.dosTypeStart,
          offsets.dosTypeStart + offsets.dosTypeLength,
        ),
      ),
    };
  };

  d64.decodeDirectoryEntryType = function (typeByte) {
    const value = Math.max(0, Math.min(255, Number(typeByte) || 0));
    const code = value & 0x07;
    const typeName =
      {
        0: "del",
        1: "seq",
        2: "prg",
        3: "usr",
        4: "rel",
      }[code] || "unknown";
    return {
      raw: value,
      code: code,
      fileType: typeName,
      closed: Boolean(value & d64.directoryEntryFlags.closed),
      locked: Boolean(value & d64.directoryEntryFlags.locked),
    };
  };

  d64.readBam = function (image) {
    const geometry = d64.describeGeometry(image);
    const sector = d64.readSector(image, DIRECTORY_TRACK, BAM_SECTOR);
    const tracks = [];
    for (let track = 1; track <= geometry.trackCount; track += 1) {
      const sectorCount = d64.trackSectorCount(track);
      const sectorFree = [];
      let freeCount = null;
      let bamOffset = null;
      if (track <= 35) {
        bamOffset = d64.headerOffsets.bamStart + (track - 1) * 4;
        freeCount = sector[bamOffset];
        for (let sectorIndex = 0; sectorIndex < sectorCount; sectorIndex += 1) {
          const byteIndex = 1 + (sectorIndex >> 3);
          const bitIndex = sectorIndex & 7;
          sectorFree.push(
            Boolean(sector[bamOffset + byteIndex] & (1 << bitIndex)),
          );
        }
      } else {
        for (let sectorIndex = 0; sectorIndex < sectorCount; sectorIndex += 1) {
          sectorFree.push(null);
        }
      }
      tracks.push({
        track: track,
        freeCount: freeCount,
        sectorFree: sectorFree,
        bamOffset: bamOffset,
        isExtendedTrack: track > 35,
      });
    }
    return {
      format: geometry.format,
      trackCount: geometry.trackCount,
      track: DIRECTORY_TRACK,
      sector: BAM_SECTOR,
      tracks: tracks,
    };
  };

  d64.readFreeMap = function (image) {
    const bam = d64.readBam(image);
    const map = {};
    bam.tracks.forEach(function (trackInfo) {
      map[trackInfo.track] = trackInfo.sectorFree.slice();
    });
    return map;
  };

  d64.analyzeBamLikeSector = function (sectorBytes, options) {
    const bytes =
      sectorBytes instanceof Uint8Array
        ? sectorBytes
        : new Uint8Array(sectorBytes || []);
    const config = options || {};
    if (bytes.length < SECTOR_SIZE) return null;
    let validTrackEntries = 0;
    let invalidTrackEntries = 0;
    let nonZeroTrackEntries = 0;
    for (let track = 1; track <= DEFAULT_TRACK_COUNT; track += 1) {
      const bamOffset = d64.headerOffsets.bamStart + (track - 1) * 4;
      const sectorCount = d64.trackSectorCount(track);
      const freeCount = bytes[bamOffset];
      const bit0 = bytes[bamOffset + 1];
      const bit1 = bytes[bamOffset + 2];
      const bit2 = bytes[bamOffset + 3];
      if (freeCount || bit0 || bit1 || bit2) {
        nonZeroTrackEntries += 1;
      }
      let computedFreeCount = 0;
      let impossibleBits = false;
      for (let sectorIndex = 0; sectorIndex < 24; sectorIndex += 1) {
        const byteIndex = sectorIndex >> 3;
        const bitIndex = sectorIndex & 7;
        const bitByte = [bit0, bit1, bit2][byteIndex];
        const isFree = Boolean(bitByte & (1 << bitIndex));
        if (sectorIndex >= sectorCount) {
          if (isFree) impossibleBits = true;
          continue;
        }
        if (isFree) computedFreeCount += 1;
      }
      if (
        !impossibleBits &&
        freeCount <= sectorCount &&
        Math.abs(freeCount - computedFreeCount) <= 1
      ) {
        validTrackEntries += 1;
      } else {
        invalidTrackEntries += 1;
      }
    }
    const dosVersionByte = bytes[d64.headerOffsets.dosVersion];
    const nextDirectoryTrack = bytes[d64.headerOffsets.nextDirectoryTrack];
    const nextDirectorySector = bytes[d64.headerOffsets.nextDirectorySector];
    const diskName = d64.decodeName(
      bytes.subarray(
        d64.headerOffsets.diskNameStart,
        d64.headerOffsets.diskNameStart + d64.headerOffsets.diskNameLength,
      ),
    );
    const diskId = d64.decodeName(
      bytes.subarray(
        d64.headerOffsets.diskIdStart,
        d64.headerOffsets.diskIdStart + d64.headerOffsets.diskIdLength,
      ),
    );
    const dosType = d64.decodeName(
      bytes.subarray(
        d64.headerOffsets.dosTypeStart,
        d64.headerOffsets.dosTypeStart + d64.headerOffsets.dosTypeLength,
      ),
    );
    const hasRecognizedDosVersion = Object.keys(d64.dosVersions).some(
      function (key) {
        return d64.dosVersions[key] === dosVersionByte;
      },
    );
    const hasReadableIdentity = Boolean(diskName || diskId || dosType);
    const directoryPointerLooksValid =
      nextDirectoryTrack === 0 ||
      (nextDirectoryTrack <= MAX_TRACK_COUNT &&
        nextDirectorySector <
          d64.trackSectorCount(Math.max(1, nextDirectoryTrack)));
    let confidence = 0;
    if (validTrackEntries >= 24) confidence += 3;
    else if (validTrackEntries >= 12) confidence += 2;
    else if (validTrackEntries >= 6) confidence += 1;
    if (hasRecognizedDosVersion) confidence += 2;
    if (hasReadableIdentity) confidence += 1;
    if (directoryPointerLooksValid) confidence += 1;
    if (nonZeroTrackEntries >= 20) confidence += 1;
    if (invalidTrackEntries > 10) confidence -= 2;
    if (config.requireScore && confidence < config.requireScore) return null;
    return {
      confidence: confidence,
      looksLikeBam: confidence >= 3 && validTrackEntries >= 6,
      validTrackEntries: validTrackEntries,
      invalidTrackEntries: invalidTrackEntries,
      nonZeroTrackEntries: nonZeroTrackEntries,
      hasRecognizedDosVersion: hasRecognizedDosVersion,
      dosVersionByte: dosVersionByte,
      nextDirectoryTrack: nextDirectoryTrack,
      nextDirectorySector: nextDirectorySector,
      diskName: diskName,
      diskId: diskId,
      dosType: dosType,
      directoryPointerLooksValid: directoryPointerLooksValid,
    };
  };

  d64.scanForUnexpectedBamSectors = function (image, options) {
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    const geometry = d64.describeGeometry(bytes);
    const config = options || {};
    const minConfidence = Math.max(
      1,
      Math.floor(Number(config.minConfidence) || 4),
    );
    const validateContents = config.validateContents !== false;
    const candidates = [];
    for (let track = 1; track <= geometry.trackCount; track += 1) {
      const sectorCount = d64.trackSectorCount(track);
      for (let sector = 0; sector < sectorCount; sector += 1) {
        if (track === DIRECTORY_TRACK && sector === BAM_SECTOR) continue;
        const analysis = d64.analyzeBamLikeSector(
          d64.readSector(bytes, track, sector),
          {
            requireScore: minConfidence,
          },
        );
        if (!analysis || !analysis.looksLikeBam) continue;
        const candidate = {
          track: track,
          sector: sector,
          confidence: analysis.confidence,
          evidence: analysis,
          reason:
            track === DIRECTORY_TRACK
              ? "bam-like sector found on track 18 outside 18/0"
              : "bam-like sector found outside the normal BAM/header sector",
        };
        if (validateContents) {
          candidate.validation = d64.validateUnexpectedBamSector(
            bytes,
            track,
            sector,
            config,
          );
        }
        candidates.push(candidate);
      }
    }
    return candidates.sort(function (left, right) {
      if (right.confidence !== left.confidence)
        return right.confidence - left.confidence;
      if (left.track !== right.track) return left.track - right.track;
      return left.sector - right.sector;
    });
  };

  d64.normalizeErrorInfo = function (errorInfo, source) {
    const geometry = d64.describeGeometry(source);
    const result = new Uint8Array(geometry.sectorCount).fill(d64.errorCodes.ok);
    const data =
      errorInfo instanceof Uint8Array
        ? errorInfo
        : errorInfo
          ? new Uint8Array(errorInfo)
          : null;
    if (data) {
      result.set(data.subarray(0, geometry.sectorCount));
    }
    return result;
  };

  d64.readErrorInfo = function (image) {
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    const geometry = d64.describeGeometry(bytes);
    return {
      format: geometry.format,
      trackCount: geometry.trackCount,
      sectorCount: geometry.sectorCount,
      hasErrorInfo: geometry.hasErrorInfo,
      errorInfoOffset: geometry.errorInfoOffset,
      bytes: geometry.hasErrorInfo
        ? bytes.slice(
            geometry.errorInfoOffset,
            geometry.errorInfoOffset + geometry.errorInfoSize,
          )
        : new Uint8Array(0),
    };
  };

  d64.readSectorError = function (image, track, sector) {
    const geometry = d64.describeGeometry(image);
    if (!geometry.hasErrorInfo) return null;
    const index = d64.sectorIndex(track, sector, geometry);
    if (index < 0) return null;
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    return bytes[geometry.errorInfoOffset + index];
  };

  d64.writeErrorInfo = function (image, errorInfo, options) {
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    const geometry = d64.describeGeometry(options || bytes);
    if (!geometry.hasErrorInfo) return bytes;
    bytes.set(
      d64.normalizeErrorInfo(errorInfo, geometry),
      geometry.errorInfoOffset,
    );
    return bytes;
  };

  d64.writeSectorError = function (image, track, sector, errorCode, options) {
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    const geometry = d64.describeGeometry(options || bytes);
    if (!geometry.hasErrorInfo) return bytes;
    const index = d64.sectorIndex(track, sector, geometry);
    if (index < 0) return bytes;
    bytes[geometry.errorInfoOffset + index] = Math.max(
      0,
      Math.min(255, Math.round(Number(errorCode) || 0)),
    );
    return bytes;
  };

  d64.clearErrorInfo = function (image, options) {
    return d64.writeErrorInfo(image, null, options);
  };

  d64.parseDirectoryEntryBytes = function (entryBytes, meta) {
    const entry =
      entryBytes instanceof Uint8Array
        ? entryBytes
        : new Uint8Array(entryBytes || []);
    const info = meta || {};
    const typeByte = entry[2];
    const typeInfo = d64.decodeDirectoryEntryType(typeByte);
    return {
      index: Math.max(0, Math.floor(Number(info.index) || 0)),
      track: Math.max(0, Math.floor(Number(info.track) || 0)),
      sector: Math.max(0, Math.floor(Number(info.sector) || 0)),
      slot: Math.max(0, Math.floor(Number(info.slot) || 0)),
      typeByte: typeByte,
      fileType: typeInfo.fileType,
      typeCode: typeInfo.code,
      closed: typeInfo.closed,
      locked: typeInfo.locked,
      startTrack: entry[3],
      startSector: entry[4],
      name: d64.decodeName(entry.subarray(5, 21)),
      sideSectorTrack: entry[21],
      sideSectorSector: entry[22],
      recordLength: entry[23],
      blockCount: entry[28] | (entry[29] << 8),
      raw: new Uint8Array(entry),
    };
  };

  d64.isDeletedDirectoryEntry = function (entry) {
    if (!entry || entry.typeByte) return false;
    return Boolean(
      entry.startTrack ||
      entry.startSector ||
      entry.blockCount ||
      entry.sideSectorTrack ||
      entry.sideSectorSector ||
      entry.recordLength ||
      String(entry.name || "").trim(),
    );
  };

  d64.readDirectoryEntriesFrom = function (
    image,
    startTrack,
    startSector,
    options,
  ) {
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    const geometry = d64.describeGeometry(bytes);
    const config = options || {};
    const includeDeleted = Boolean(config.includeDeleted);
    const maxEntries = Math.max(
      1,
      Math.floor(Number(config.maxEntries) || 144),
    );
    const entries = [];
    const sectors = [];
    const visited = {};
    let track = Math.max(0, Math.floor(Number(startTrack) || 0));
    let sector = Math.max(0, Math.floor(Number(startSector) || 0));
    let index = 0;
    while (track && entries.length < maxEntries) {
      if (
        track > geometry.trackCount ||
        sector >= d64.trackSectorCount(track)
      ) {
        throw new Error(
          "Directory chain points outside geometry at " +
            String(track) +
            ":" +
            String(sector),
        );
      }
      const key = String(track) + ":" + String(sector);
      if (visited[key]) {
        throw new Error("Directory chain loops at " + key);
      }
      visited[key] = true;
      const block = d64.readSector(bytes, track, sector);
      sectors.push({
        track: track,
        sector: sector,
        nextTrack: block[0],
        nextSector: block[1],
        raw: new Uint8Array(block),
      });
      for (let slot = 0; slot < 8 && entries.length < maxEntries; slot += 1) {
        const offset = slot * 32;
        const entry = d64.parseDirectoryEntryBytes(
          block.subarray(offset, offset + 32),
          {
            index: index,
            track: track,
            sector: sector,
            slot: slot,
          },
        );
        index += 1;
        entry.deleted = d64.isDeletedDirectoryEntry(entry);
        if (!entry.typeByte && !includeDeleted) continue;
        if (!entry.typeByte && !entry.deleted) continue;
        entries.push(entry);
      }
      if (!block[0]) break;
      track = block[0];
      sector = block[1];
    }
    return {
      entries: entries,
      sectors: sectors,
    };
  };

  d64.readDirectoryEntry = function (image, entryIndex) {
    const index = Math.max(0, Math.floor(Number(entryIndex) || 0));
    const sectorIndex = Math.floor(index / 8);
    const slotIndex = index % 8;
    const sector = d64.readSector(
      image,
      DIRECTORY_TRACK,
      DIRECTORY_START_SECTOR + sectorIndex,
    );
    const offset = slotIndex * 32;
    return d64.parseDirectoryEntryBytes(sector.subarray(offset, offset + 32), {
      index: index,
      track: DIRECTORY_TRACK,
      sector: DIRECTORY_START_SECTOR + sectorIndex,
      slot: slotIndex,
    });
  };

  d64.readDirectoryEntries = function (image, options) {
    const header = d64.readHeader(image);
    return d64
      .readDirectoryEntriesFrom(
        image,
        header.nextDirectoryTrack,
        header.nextDirectorySector,
        options,
      )
      .entries.filter(function (entry) {
        return entry.typeByte;
      });
  };

  d64.readDeletedEntries = function (image, options) {
    const header = d64.readHeader(image);
    return d64
      .readDirectoryEntriesFrom(
        image,
        header.nextDirectoryTrack,
        header.nextDirectorySector,
        Object.assign({}, options || {}, { includeDeleted: true }),
      )
      .entries.filter(function (entry) {
        return entry.deleted === true;
      });
  };

  d64.findDirectoryEntryByName = function (image, name, options) {
    const target = String(name || "")
      .trim()
      .toUpperCase();
    if (!target) return null;
    const entries = d64.readDirectoryEntries(image, options);
    for (let index = 0; index < entries.length; index += 1) {
      if (
        String(entries[index].name || "")
          .trim()
          .toUpperCase() === target
      ) {
        return entries[index];
      }
    }
    return null;
  };

  d64.readFileChain = function (image, startTrack, startSector) {
    const blocks = [];
    const payload = [];
    let unusedTailData = new Uint8Array(0);
    const visited = {};
    let track = Math.max(0, Math.floor(Number(startTrack) || 0));
    let sector = Math.max(0, Math.floor(Number(startSector) || 0));
    while (track) {
      const key = String(track) + ":" + String(sector);
      if (visited[key]) {
        throw new Error("File chain loops at " + key);
      }
      visited[key] = true;
      const block = d64.readSector(image, track, sector);
      const nextTrack = block[0];
      const nextSector = block[1];
      const usedBytes =
        nextTrack === 0 ? Math.max(0, Math.min(254, nextSector - 1)) : 254;
      const unusedBytes = nextTrack === 0 ? Math.max(0, 254 - usedBytes) : 0;
      for (let index = 0; index < usedBytes; index += 1) {
        payload.push(block[2 + index]);
      }
      if (!nextTrack && unusedBytes) {
        unusedTailData = block.slice(
          2 + usedBytes,
          2 + usedBytes + unusedBytes,
        );
      }
      blocks.push({
        track: track,
        sector: sector,
        nextTrack: nextTrack,
        nextSector: nextSector,
        usedBytes: usedBytes,
        unusedBytes: unusedBytes,
      });
      if (!nextTrack) break;
      track = nextTrack;
      sector = nextSector;
    }
    return {
      blocks: blocks,
      payload: new Uint8Array(payload),
      unusedTailData: unusedTailData,
      unusedTailLength: unusedTailData.length,
      hasUnusedTailData: unusedTailData.some(function (value) {
        return value !== 0;
      }),
    };
  };

  d64.validateUnexpectedBamSector = function (
    image,
    bamTrack,
    bamSector,
    options,
  ) {
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    const geometry = d64.describeGeometry(bytes);
    const config = options || {};
    const sectorBytes = d64.readSector(bytes, bamTrack, bamSector);
    const analysis = d64.analyzeBamLikeSector(sectorBytes);
    if (!analysis || !analysis.looksLikeBam) return null;
    const referencedSectors = {};
    const addReferencedSector = function (track, sector, kind) {
      const key = String(track) + ":" + String(sector);
      referencedSectors[key] = {
        track: track,
        sector: sector,
        kind: kind,
      };
    };
    addReferencedSector(bamTrack, bamSector, "bam");
    let directory = null;
    let directoryError = null;
    let directoryReachable = false;
    try {
      directory = d64.readDirectoryEntriesFrom(
        bytes,
        analysis.nextDirectoryTrack,
        analysis.nextDirectorySector,
        config,
      );
      directoryReachable = true;
      directory.sectors.forEach(function (sectorInfo) {
        addReferencedSector(sectorInfo.track, sectorInfo.sector, "directory");
      });
    } catch (error) {
      directoryError = error;
    }
    let validFileChains = 0;
    let invalidFileChains = 0;
    const fileResults = [];
    if (directoryReachable && directory) {
      directory.entries.forEach(function (entry) {
        try {
          const chain = d64.readFileChain(
            bytes,
            entry.startTrack,
            entry.startSector,
          );
          chain.blocks.forEach(function (block) {
            addReferencedSector(block.track, block.sector, "file");
          });
          let sideSectors = [];
          if (entry.fileType === "rel" && entry.sideSectorTrack) {
            sideSectors = d64.readRelativeSideSectors(
              bytes,
              entry.sideSectorTrack,
              entry.sideSectorSector,
            );
            sideSectors.forEach(function (sideSector) {
              addReferencedSector(
                sideSector.track,
                sideSector.sector,
                "rel-side",
              );
              sideSector.dataSectors.forEach(function (dataSector) {
                addReferencedSector(
                  dataSector.track,
                  dataSector.sector,
                  "rel-data-ref",
                );
              });
            });
          }
          validFileChains += 1;
          fileResults.push({
            name: entry.name,
            fileType: entry.fileType,
            valid: true,
            blockCount: chain.blocks.length,
            sideSectorCount: sideSectors.length,
          });
        } catch (error) {
          invalidFileChains += 1;
          fileResults.push({
            name: entry.name,
            fileType: entry.fileType,
            valid: false,
            error: String(error && error.message ? error.message : error),
          });
        }
      });
    }
    const bamAgreement = {
      checkedTracks: 0,
      checkedSectors: 0,
      mismatchedUsedAsFree: 0,
      mismatchedUsedAsUnknown: 0,
    };
    for (
      let track = 1;
      track <= Math.min(DEFAULT_TRACK_COUNT, geometry.trackCount);
      track += 1
    ) {
      const bamOffset = d64.headerOffsets.bamStart + (track - 1) * 4;
      const sectorCount = d64.trackSectorCount(track);
      const bit0 = sectorBytes[bamOffset + 1];
      const bit1 = sectorBytes[bamOffset + 2];
      const bit2 = sectorBytes[bamOffset + 3];
      bamAgreement.checkedTracks += 1;
      for (let sector = 0; sector < sectorCount; sector += 1) {
        const key = String(track) + ":" + String(sector);
        if (!referencedSectors[key]) continue;
        const byteIndex = sector >> 3;
        const bitIndex = sector & 7;
        const bitByte = [bit0, bit1, bit2][byteIndex];
        const isFree = Boolean(bitByte & (1 << bitIndex));
        bamAgreement.checkedSectors += 1;
        if (isFree) {
          bamAgreement.mismatchedUsedAsFree += 1;
        }
      }
    }
    return {
      bamTrack: bamTrack,
      bamSector: bamSector,
      directoryReachable: directoryReachable,
      directoryError: directoryError
        ? String(
            directoryError && directoryError.message
              ? directoryError.message
              : directoryError,
          )
        : null,
      directoryEntryCount:
        directory && directory.entries ? directory.entries.length : 0,
      directorySectorCount:
        directory && directory.sectors ? directory.sectors.length : 0,
      validFileChains: validFileChains,
      invalidFileChains: invalidFileChains,
      fileResults: fileResults,
      bamAgreement: bamAgreement,
      referencedSectorCount: Object.keys(referencedSectors).length,
      referencedSectors: Object.keys(referencedSectors).map(function (key) {
        return referencedSectors[key];
      }),
      looksConsistent:
        directoryReachable &&
        invalidFileChains === 0 &&
        bamAgreement.mismatchedUsedAsFree === 0,
    };
  };

  d64.readRelativeSideSectors = function (
    image,
    sideSectorTrack,
    sideSectorSector,
  ) {
    const sectors = [];
    const visited = {};
    let track = Math.max(0, Math.floor(Number(sideSectorTrack) || 0));
    let sector = Math.max(0, Math.floor(Number(sideSectorSector) || 0));
    while (track) {
      const key = String(track) + ":" + String(sector);
      if (visited[key]) {
        throw new Error("Side-sector chain loops at " + key);
      }
      visited[key] = true;
      const block = d64.readSector(image, track, sector);
      const allSideSectors = [];
      const dataSectors = [];
      for (let index = 0; index < REL_MAX_SIDE_SECTORS; index += 1) {
        const pointerTrack = block[4 + index * 2];
        const pointerSector = block[5 + index * 2];
        if (!pointerTrack) break;
        allSideSectors.push({
          track: pointerTrack,
          sector: pointerSector,
        });
      }
      for (let offset = 16; offset < 256; offset += 2) {
        const pointerTrack = block[offset];
        const pointerSector = block[offset + 1];
        if (!pointerTrack) break;
        dataSectors.push({
          track: pointerTrack,
          sector: pointerSector,
        });
      }
      sectors.push({
        track: track,
        sector: sector,
        nextTrack: block[0],
        nextSector: block[1],
        sideSectorIndex: block[2],
        recordLength: block[3],
        allSideSectors: allSideSectors,
        dataSectors: dataSectors,
        raw: new Uint8Array(block),
      });
      if (!block[0]) break;
      track = block[0];
      sector = block[1];
    }
    return sectors;
  };

  d64.readFile = function (image, entryOrName, options) {
    const config = options || {};
    const entry =
      typeof entryOrName === "string"
        ? d64.findDirectoryEntryByName(image, entryOrName, config)
        : entryOrName || null;
    if (!entry) return null;
    const chain = d64.readFileChain(image, entry.startTrack, entry.startSector);
    const result = {
      entry: entry,
      fileType: entry.fileType,
      payload: chain.payload,
      blocks: chain.blocks,
      unusedTailData: chain.unusedTailData,
      unusedTailLength: chain.unusedTailLength,
      hasUnusedTailData: chain.hasUnusedTailData,
    };
    if (entry.fileType === "rel" && entry.sideSectorTrack) {
      result.sideSectors = d64.readRelativeSideSectors(
        image,
        entry.sideSectorTrack,
        entry.sideSectorSector,
      );
    }
    return result;
  };

  d64.readRelativeRecords = function (image, entryOrName, options) {
    const file = d64.readFile(image, entryOrName, options);
    if (!file || file.fileType !== "rel") return null;
    const recordLength = Math.max(1, Number(file.entry.recordLength) || 1);
    const records = [];
    for (let offset = 0; offset < file.payload.length; offset += recordLength) {
      records.push(file.payload.slice(offset, offset + recordLength));
    }
    return {
      entry: file.entry,
      recordLength: recordLength,
      recordCount: records.length,
      records: records,
      sideSectors: file.sideSectors || [],
      payload: file.payload,
      blocks: file.blocks,
      unusedTailData: file.unusedTailData,
      unusedTailLength: file.unusedTailLength,
      hasUnusedTailData: file.hasUnusedTailData,
    };
  };

  d64.readFiles = function (image, options) {
    return d64.readDirectoryEntries(image, options).map(function (entry) {
      const file = d64.readFile(image, entry, options);
      return {
        name: entry.name,
        type: entry.fileType,
        closed: entry.closed,
        locked: entry.locked,
        recordLength: entry.recordLength || undefined,
        data: file ? file.payload.slice() : new Uint8Array(0),
        unusedTailData: file ? file.unusedTailData.slice() : new Uint8Array(0),
        entry: entry,
      };
    });
  };

  d64.readDeletedFile = function (image, entry) {
    if (!entry || !entry.deleted) return null;
    const inferredType = entry.sideSectorTrack ? "rel" : "prg";
    const chain = d64.readFileChain(image, entry.startTrack, entry.startSector);
    const result = {
      entry: entry,
      fileType: inferredType,
      payload: chain.payload,
      blocks: chain.blocks,
      unusedTailData: chain.unusedTailData,
      unusedTailLength: chain.unusedTailLength,
      hasUnusedTailData: chain.hasUnusedTailData,
      recordLength:
        inferredType === "rel"
          ? d64.normalizeRecordLength(entry.recordLength)
          : 0,
    };
    if (inferredType === "rel" && entry.sideSectorTrack) {
      result.sideSectors = d64.readRelativeSideSectors(
        image,
        entry.sideSectorTrack,
        entry.sideSectorSector,
      );
    }
    return result;
  };

  d64.writeDirectoryEntryBytes = function (image, entryOrIndex, entryBytes) {
    const bytes =
      image instanceof Uint8Array ? image.slice() : new Uint8Array(image || []);
    const entry =
      typeof entryOrIndex === "number"
        ? d64.readDirectoryEntry(bytes, entryOrIndex)
        : entryOrIndex;
    if (!entry) {
      throw new Error("Directory entry not found.");
    }
    const normalizedEntryBytes =
      entryBytes instanceof Uint8Array
        ? entryBytes
        : new Uint8Array(entryBytes || []);
    if (normalizedEntryBytes.length < 32) {
      throw new Error("Directory entry must be 32 bytes.");
    }
    bytes.set(
      normalizedEntryBytes.subarray(0, 32),
      d64.trackOffset(entry.track, entry.sector) + entry.slot * 32,
    );
    return bytes;
  };

  d64.writeBamFreeMap = function (image, freeMap, options) {
    const bytes =
      image instanceof Uint8Array ? image.slice() : new Uint8Array(image || []);
    const header = d64.readHeader(bytes);
    const bamSector = d64.createBamSector(
      freeMap,
      Object.assign({}, header, options || {}),
    );
    bytes.set(bamSector, d64.trackOffset(DIRECTORY_TRACK, BAM_SECTOR));
    return bytes;
  };

  d64.buildAllocationFromFreeMap = function (freeMap, options) {
    const config = options || {};
    const geometry = d64.describeGeometry(config);
    const allocation = {
      track: 1,
      sector: 0,
      trackCount: geometry.trackCount,
      mode: d64.normalizeAllocationMode(config.allocationMode),
      fragmentStride: Math.max(
        2,
        Math.floor(Number(config.fragmentStride) || 29),
      ),
      fragmentCursor: Math.max(
        0,
        Math.floor(Number(config.fragmentCursor) || 0),
      ),
      map: {},
      directorySectors: [],
      preferredTrackOrder:
        config.preferredTrackOrder ||
        d64.centerOutTrackOrder(geometry.trackCount),
    };
    for (let track = 1; track <= geometry.trackCount; track += 1) {
      const sectorCount = d64.trackSectorCount(track);
      const trackMap = freeMap[track] || new Array(sectorCount).fill(true);
      allocation.map[track] = trackMap.slice(0, sectorCount);
      if (allocation.map[track].length < sectorCount) {
        while (allocation.map[track].length < sectorCount) {
          allocation.map[track].push(true);
        }
      }
    }
    return allocation;
  };

  d64.collectDeletedRebuildEntries = function (image, options) {
    const deletedEntries = d64.readDeletedEntries(image, options);
    const activeEntries = d64.readDirectoryEntries(image, options);
    const activeRefs = {};
    activeEntries.forEach(function (entry) {
      try {
        d64.collectFileSectorRefs(image, entry).forEach(function (ref) {
          activeRefs[String(ref.track) + ":" + String(ref.sector)] = true;
        });
      } catch (error) {
        // Ignore invalid active chains here; rebuild logic handles active files separately.
      }
    });
    const plans = deletedEntries.map(function (entry) {
      try {
        const deletedFile = d64.readDeletedFile(image, entry);
        const refs = d64.collectFileSectorRefs(image, entry, {
          restoredType: deletedFile.fileType,
        });
        return {
          entry: entry,
          valid: true,
          file: {
            name: entry.name,
            type: deletedFile.fileType,
            closed: entry.closed,
            locked: entry.locked,
            recordLength: deletedFile.recordLength,
            data: deletedFile.payload.slice(),
            unusedTailData: deletedFile.unusedTailData.slice(),
          },
          totalSectors: d64.prepareFileLayout({
            type: deletedFile.fileType,
            data: deletedFile.payload,
            recordLength: deletedFile.recordLength,
            unusedTailData: deletedFile.unusedTailData,
          }).totalSectors,
          refs: refs,
          refKeys: refs.map(function (ref) {
            return String(ref.track) + ":" + String(ref.sector);
          }),
        };
      } catch (error) {
        return {
          entry: entry,
          valid: false,
        };
      }
    });
    const deletedRefCounts = {};
    plans.forEach(function (plan) {
      if (!plan.valid) return;
      plan.refKeys.forEach(function (key) {
        deletedRefCounts[key] = (deletedRefCounts[key] || 0) + 1;
      });
    });
    return plans.filter(function (plan) {
      if (!plan.valid) return false;
      return !plan.refKeys.some(function (key) {
        return activeRefs[key] || deletedRefCounts[key] > 1;
      });
    });
  };

  d64.selectDeletedPlansToDrop = function (
    deletedPlans,
    requiredSectorRelease,
    requiredSlotRelease,
  ) {
    const plans = (Array.isArray(deletedPlans) ? deletedPlans : []).slice();
    plans.sort(function (left, right) {
      if (right.totalSectors !== left.totalSectors) {
        return right.totalSectors - left.totalSectors;
      }
      return left.entry.index - right.entry.index;
    });
    const dropped = {};
    let releasedSectors = 0;
    let releasedSlots = 0;
    for (let index = 0; index < plans.length; index += 1) {
      if (
        releasedSectors >= requiredSectorRelease &&
        releasedSlots >= requiredSlotRelease
      ) {
        break;
      }
      const plan = plans[index];
      dropped[plan.entry.index] = true;
      releasedSectors += plan.totalSectors;
      releasedSlots += 1;
    }
    if (
      releasedSectors < requiredSectorRelease ||
      releasedSlots < requiredSlotRelease
    ) {
      return null;
    }
    return dropped;
  };

  d64.collectFileSectorRefs = function (image, entry, options) {
    if (!entry || !entry.startTrack) return [];
    const refs = [];
    const addRef = function (track, sector) {
      refs.push({
        track: Math.max(0, Math.floor(Number(track) || 0)),
        sector: Math.max(0, Math.floor(Number(sector) || 0)),
      });
    };
    const file = d64.readFile(image, entry, options);
    if (file && Array.isArray(file.blocks)) {
      file.blocks.forEach(function (block) {
        addRef(block.track, block.sector);
      });
    }
    const typeName =
      options && options.restoredType
        ? d64.decodeDirectoryEntryType(
            d64.encodeDirectoryEntryType(options.restoredType),
          ).fileType
        : entry.fileType;
    if (typeName === "rel" && entry.sideSectorTrack) {
      d64
        .readRelativeSideSectors(
          image,
          entry.sideSectorTrack,
          entry.sideSectorSector,
        )
        .forEach(function (sideSector) {
          addRef(sideSector.track, sideSector.sector);
        });
    }
    return refs;
  };

  d64.updateFreeMapSectors = function (freeMap, sectors, isFree) {
    const map = freeMap;
    (Array.isArray(sectors) ? sectors : []).forEach(function (ref) {
      const track = Math.max(0, Math.floor(Number(ref.track) || 0));
      const sector = Math.max(0, Math.floor(Number(ref.sector) || 0));
      if (!map[track] || map[track][sector] == null) return;
      map[track][sector] = Boolean(isFree);
    });
    return map;
  };

  d64.scratchFile = function (image, entryOrName, options) {
    const entry =
      typeof entryOrName === "string"
        ? d64.findDirectoryEntryByName(image, entryOrName, options)
        : entryOrName || null;
    if (!entry) {
      throw new Error("File not found: " + String(entryOrName || ""));
    }
    const freeMap = d64.readFreeMap(image);
    const sectorRefs = d64.collectFileSectorRefs(image, entry, options);
    d64.updateFreeMapSectors(freeMap, sectorRefs, true);
    const entryBytes = entry.raw.slice();
    entryBytes[2] = 0x00;
    const withDeletedEntry = d64.writeDirectoryEntryBytes(
      image,
      entry,
      entryBytes,
    );
    return d64.writeBamFreeMap(withDeletedEntry, freeMap);
  };

  d64.undeleteFile = function (image, deletedEntryOrName, restoreOptions) {
    const options = restoreOptions || {};
    const deletedEntries = d64.readDeletedEntries(image, options);
    const entry =
      typeof deletedEntryOrName === "string"
        ? deletedEntries.find(function (candidate) {
            return (
              String(candidate.name || "")
                .trim()
                .toUpperCase() ===
              String(deletedEntryOrName || "")
                .trim()
                .toUpperCase()
            );
          }) || null
        : deletedEntryOrName || null;
    if (!entry || !entry.deleted) {
      throw new Error(
        "Deleted file not found: " + String(deletedEntryOrName || ""),
      );
    }
    const restoredName = d64.normalizeFileName(entry.name, 16);
    const existingActiveFile = d64
      .readFiles(image, options)
      .find(function (file) {
        return d64.normalizeFileName(file.name, 16) === restoredName;
      });
    if (existingActiveFile) {
      throw new Error("File already exists: " + restoredName);
    }
    const restoredType = String(options.type || "")
      .trim()
      .toLowerCase();
    if (!restoredType || restoredType === "del") {
      throw new Error("A restore file type must be chosen.");
    }
    const freeMap = d64.readFreeMap(image);
    const sectorRefs = d64.collectFileSectorRefs(image, entry, {
      restoredType: restoredType,
    });
    for (let index = 0; index < sectorRefs.length; index += 1) {
      const ref = sectorRefs[index];
      if (freeMap[ref.track] && freeMap[ref.track][ref.sector] === false) {
        throw new Error(
          "Cannot undelete because sector " +
            String(ref.track) +
            ":" +
            String(ref.sector) +
            " is already in use.",
        );
      }
    }
    d64.updateFreeMapSectors(freeMap, sectorRefs, false);
    const entryBytes = entry.raw.slice();
    entryBytes[2] = d64.encodeDirectoryEntryType(restoredType, {
      closed: options.closed !== false,
      locked: Boolean(options.locked),
    });
    const withRestoredEntry = d64.writeDirectoryEntryBytes(
      image,
      entry,
      entryBytes,
    );
    return d64.writeBamFreeMap(withRestoredEntry, freeMap);
  };

  d64.inspectImage = function (image, options) {
    return {
      header: d64.readHeader(image),
      bam: d64.readBam(image),
      errorInfo: d64.readErrorInfo(image),
      unexpectedBamSectors: d64.scanForUnexpectedBamSectors(image, options),
      entries: d64.readDirectoryEntries(image, options),
      files: d64.readFiles(image, options),
    };
  };

  d64.diskSignature = function (image) {
    const header = d64.readHeader(image);
    const errorInfo = d64.readErrorInfo(image);
    return JSON.stringify({
      format: header.format,
      imageSize: header.imageSize,
      trackCount: header.trackCount,
      hasErrorInfo: header.hasErrorInfo,
      nextDirectoryTrack: header.nextDirectoryTrack,
      nextDirectorySector: header.nextDirectorySector,
      dosVersionByte: header.dosVersionByte,
      diskName: header.diskName,
      diskId: header.diskId,
      dosType: header.dosType,
      errorInfo: Array.from(errorInfo.bytes),
    });
  };

  d64.hasDiskChanged = function (leftImage, rightImage) {
    return d64.diskSignature(leftImage) !== d64.diskSignature(rightImage);
  };

  d64.isRelativeFileType = function (type) {
    return d64.normalizeFileType(type) === d64.fileTypes.rel;
  };

  d64.prepareFileLayout = function (file) {
    const entry = file || {};
    const type = d64.normalizeFileType(entry.type);
    const bytes =
      entry.data instanceof Uint8Array
        ? entry.data
        : new Uint8Array(entry.data || []);
    if (type !== d64.fileTypes.rel) {
      const dataSectors = Math.max(1, Math.ceil(bytes.length / 254));
      const unusedTailLength = Math.max(0, dataSectors * 254 - bytes.length);
      return {
        type: type,
        bytes: bytes,
        dataSectors: dataSectors,
        sideSectorCount: 0,
        totalSectors: dataSectors,
        closed: entry.closed !== false,
        locked: Boolean(entry.locked),
        recordLength: 0,
        recordCount: 0,
        unusedTailData: d64.normalizeUnusedTailData(
          entry.unusedTailData,
          unusedTailLength,
        ),
      };
    }
    const recordLength = d64.normalizeRecordLength(entry.recordLength);
    const recordCount = Math.max(1, Math.ceil(bytes.length / recordLength));
    const paddedLength = recordCount * recordLength;
    const paddedBytes = new Uint8Array(paddedLength);
    paddedBytes.set(bytes.subarray(0, Math.min(bytes.length, paddedLength)));
    const dataSectors = Math.max(1, Math.ceil(paddedBytes.length / 254));
    const sideSectorCount = Math.max(
      1,
      Math.ceil(dataSectors / REL_DATA_SECTORS_PER_SIDE_SECTOR),
    );
    if (sideSectorCount > REL_MAX_SIDE_SECTORS) {
      throw new Error(
        "REL file exceeds side-sector capacity: " + String(entry.name || ""),
      );
    }
    const unusedTailLength = Math.max(
      0,
      dataSectors * 254 - paddedBytes.length,
    );
    return {
      type: type,
      bytes: paddedBytes,
      dataSectors: dataSectors,
      sideSectorCount: sideSectorCount,
      totalSectors: dataSectors + sideSectorCount,
      closed: entry.closed !== false,
      locked: Boolean(entry.locked),
      recordLength: recordLength,
      recordCount: recordCount,
      unusedTailData: d64.normalizeUnusedTailData(
        entry.unusedTailData,
        unusedTailLength,
      ),
    };
  };

  d64.createBamSector = function (freeMap, options) {
    const diskInfo = d64.normalizeDiskInfo(
      typeof options === "string" ? { diskName: options } : options,
    );
    const sector = new Uint8Array(256);
    sector[0] = DIRECTORY_TRACK;
    sector[1] = DIRECTORY_START_SECTOR;
    sector[2] = diskInfo.dosVersion;
    sector[3] = 0x00;
    for (let track = 1; track <= DEFAULT_TRACK_COUNT; track += 1) {
      const trackOffset = 0x04 + (track - 1) * 4;
      const sectorCount = d64.trackSectorCount(track);
      let freeCount = 0;
      const bitmask = [0, 0, 0];
      for (let sectorIndex = 0; sectorIndex < sectorCount; sectorIndex += 1) {
        const isFree = Boolean(freeMap[track] && freeMap[track][sectorIndex]);
        if (!isFree) continue;
        freeCount += 1;
        const byteIndex = sectorIndex >> 3;
        const bitIndex = sectorIndex & 7;
        bitmask[byteIndex] |= 1 << bitIndex;
      }
      sector[trackOffset] = freeCount;
      sector[trackOffset + 1] = bitmask[0];
      sector[trackOffset + 2] = bitmask[1];
      sector[trackOffset + 3] = bitmask[2];
    }
    const nameBytes = d64.encodeFileName(diskInfo.diskName, 16);
    sector.set(nameBytes, 0x90);
    sector[0xa0] = 0xa0;
    sector[0xa1] = 0xa0;
    sector.set(d64.encodeFileName(diskInfo.diskId, 2), 0xa2);
    sector[0xa4] = 0xa0;
    sector.set(d64.encodeFileName(diskInfo.dosType, 2), 0xa5);
    sector[0xa7] = 0xa0;
    sector[0xa8] = 0xa0;
    return sector;
  };

  d64.createDirectorySector = function (entries, sectorIndex, totalSectors) {
    const sectorOrder =
      arguments.length > 3 && Array.isArray(arguments[3]) ? arguments[3] : null;
    const sector = new Uint8Array(256);
    const entriesPerSector = 8;
    for (let entryIndex = 0; entryIndex < entriesPerSector; entryIndex += 1) {
      const entry = entries[sectorIndex * entriesPerSector + entryIndex];
      if (!entry) break;
      sector.set(entry, entryIndex * 32);
    }
    if (sectorIndex < totalSectors - 1) {
      sector[0] = 18;
      sector[1] =
        sectorOrder && Number.isFinite(Number(sectorOrder[sectorIndex + 1]))
          ? Math.floor(Number(sectorOrder[sectorIndex + 1]))
          : sectorIndex + 2;
    } else {
      sector[0] = 0;
      sector[1] = 255;
    }
    return sector;
  };

  d64.findNextDirectoryInterleaveSector = function (
    currentSector,
    usedSectors,
  ) {
    const track18SectorCount = d64.trackSectorCount(DIRECTORY_TRACK);
    const used = {};
    (Array.isArray(usedSectors) ? usedSectors : []).forEach(function (sector) {
      const normalizedSector = Math.max(0, Math.floor(Number(sector) || 0));
      used[normalizedSector] = true;
    });
    let candidate =
      (Math.max(0, Math.floor(Number(currentSector) || 0)) + 3) %
      track18SectorCount;
    for (let attempts = 0; attempts < track18SectorCount; attempts += 1) {
      if (candidate !== BAM_SECTOR && !used[candidate]) {
        return candidate;
      }
      candidate = (candidate + 1) % track18SectorCount;
    }
    return null;
  };

  d64.buildDirectorySectorOrder = function (totalSectors, options) {
    const count = Math.max(
      1,
      Math.min(18, Math.floor(Number(totalSectors) || 0)),
    );
    const config = options || {};
    const mode = d64.normalizeAllocationMode(config.allocationMode);
    const order = [1];
    if (count <= 1) return order;
    if (mode === "fragmented") {
      const remaining = [];
      for (let sector = 2; sector <= 18; sector += 1) {
        remaining.push(sector);
      }
      let stride = Math.max(2, Math.floor(Number(config.fragmentStride) || 5));
      while (
        remaining.length > 1 &&
        d64.greatestCommonDivisor(stride, remaining.length) !== 1
      ) {
        stride += 1;
      }
      let cursor =
        Math.max(0, Math.floor(Number(config.fragmentCursor) || 0)) %
        remaining.length;
      const used = new Array(remaining.length).fill(false);
      while (order.length < count) {
        if (!used[cursor]) {
          used[cursor] = true;
          order.push(remaining[cursor]);
        }
        cursor = (cursor + stride) % remaining.length;
      }
      return order;
    }
    while (order.length < count) {
      const nextSector = d64.findNextDirectoryInterleaveSector(
        order[order.length - 1],
        order,
      );
      if (!Number.isFinite(Number(nextSector))) break;
      order.push(nextSector);
    }
    return order;
  };

  d64.createDirectoryEntry = function (
    filename,
    type,
    startTrack,
    startSector,
    sectorCount,
    options,
  ) {
    const config = options || {};
    const entry = new Uint8Array(32).fill(0);
    entry[2] = d64.encodeDirectoryEntryType(type, {
      closed: config.closed,
      locked: config.locked,
    });
    entry[3] = startTrack;
    entry[4] = startSector;
    entry.set(d64.encodeFileName(filename, 16), 5);
    entry[21] = Math.max(0, Math.min(255, Number(config.sideSectorTrack) || 0));
    entry[22] = Math.max(
      0,
      Math.min(255, Number(config.sideSectorSector) || 0),
    );
    entry[23] = Math.max(0, Math.min(255, Number(config.recordLength) || 0));
    entry[28] = sectorCount & 0xff;
    entry[29] = (sectorCount >> 8) & 0xff;
    entry[30] = sectorCount & 0xff;
    entry[31] = (sectorCount >> 8) & 0xff;
    return entry;
  };

  d64.createDeletedDirectoryEntry = function (
    filename,
    startTrack,
    startSector,
    sectorCount,
    options,
  ) {
    const config = options || {};
    const entry = new Uint8Array(32).fill(0);
    entry[2] = 0x00;
    entry[3] = Math.max(0, Math.min(255, Number(startTrack) || 0));
    entry[4] = Math.max(0, Math.min(255, Number(startSector) || 0));
    entry.set(d64.encodeFileName(filename, 16), 5);
    entry[21] = Math.max(0, Math.min(255, Number(config.sideSectorTrack) || 0));
    entry[22] = Math.max(
      0,
      Math.min(255, Number(config.sideSectorSector) || 0),
    );
    entry[23] = Math.max(0, Math.min(255, Number(config.recordLength) || 0));
    entry[28] = sectorCount & 0xff;
    entry[29] = (sectorCount >> 8) & 0xff;
    entry[30] = sectorCount & 0xff;
    entry[31] = (sectorCount >> 8) & 0xff;
    return entry;
  };

  d64.normalizeAllocationMode = function (mode) {
    return String(mode || "")
      .trim()
      .toLowerCase() === "fragmented"
      ? "fragmented"
      : "sequential";
  };

  d64.greatestCommonDivisor = function (left, right) {
    let a = Math.abs(Math.floor(Number(left) || 0));
    let b = Math.abs(Math.floor(Number(right) || 0));
    while (b) {
      const next = a % b;
      a = b;
      b = next;
    }
    return a || 1;
  };

  d64.collectAllocatableSectors = function (allocation) {
    const result = [];
    const trackLimit = d64.normalizeTrackCount(
      allocation.trackCount || DEFAULT_TRACK_COUNT,
    );
    for (let track = 1; track <= trackLimit; track += 1) {
      if (track === DIRECTORY_TRACK) continue;
      const sectorCount = d64.trackSectorCount(track);
      allocation.map[track] =
        allocation.map[track] || new Array(sectorCount).fill(true);
      for (let sector = 0; sector < sectorCount; sector += 1) {
        if (!allocation.map[track][sector]) continue;
        result.push({ track: track, sector: sector });
      }
    }
    return result;
  };

  d64.centerOutTrackOrder = function (trackCount) {
    const maxTrack = d64.normalizeTrackCount(trackCount);
    const order = [];
    for (let distance = 1; order.length < maxTrack - 1; distance += 1) {
      const lower = DIRECTORY_TRACK - distance;
      const upper = DIRECTORY_TRACK + distance;
      if (lower >= 1) order.push(lower);
      if (upper <= maxTrack) order.push(upper);
    }
    return order;
  };

  d64.outerInTrackOrder = function (trackCount) {
    const maxTrack = d64.normalizeTrackCount(trackCount);
    const order = [];
    for (let distance = maxTrack; distance >= 1; distance -= 1) {
      for (let track = 1; track <= maxTrack; track += 1) {
        if (track === DIRECTORY_TRACK) continue;
        if (Math.abs(track - DIRECTORY_TRACK) !== distance) continue;
        order.push(track);
      }
    }
    return order;
  };

  d64.findNextCenterOutStartSector = function (
    allocation,
    preferredTrackOrder,
  ) {
    const trackOrder =
      preferredTrackOrder || d64.centerOutTrackOrder(allocation.trackCount);
    for (let index = 0; index < trackOrder.length; index += 1) {
      const track = trackOrder[index];
      if (track === DIRECTORY_TRACK) continue;
      const sectorCount = d64.trackSectorCount(track);
      allocation.map[track] =
        allocation.map[track] || new Array(sectorCount).fill(true);
      for (let sector = 0; sector < sectorCount; sector += 1) {
        if (!allocation.map[track][sector]) continue;
        return { track: track, sector: sector };
      }
    }
    return null;
  };

  d64.estimateNextSectorWindow = function (previousBlock, targetTrack) {
    if (!previousBlock) return 0;
    const previousSectorCount = d64.trackSectorCount(previousBlock.track);
    const targetSectorCount = d64.trackSectorCount(targetTrack);
    const seekDistance = Math.abs(targetTrack - previousBlock.track);
    const rotationalLead = Math.min(
      previousSectorCount + targetSectorCount,
      seekDistance === 0 ? 9 : seekDistance === 1 ? 4 : 2 + seekDistance * 2,
    );
    return (previousBlock.sector + rotationalLead) % targetSectorCount;
  };

  d64.findNearestSmartSector = function (allocation, previousBlock) {
    const freePool = d64.collectAllocatableSectors(allocation);
    if (!freePool.length) return null;
    const previousSide = previousBlock
      ? previousBlock.track < DIRECTORY_TRACK
        ? "inner"
        : "outer"
      : null;
    let best = null;
    let bestScore = Infinity;
    for (let index = 0; index < freePool.length; index += 1) {
      const candidate = freePool[index];
      const candidateSide =
        candidate.track < DIRECTORY_TRACK ? "inner" : "outer";
      const seekDistance = previousBlock
        ? Math.abs(candidate.track - previousBlock.track)
        : Math.abs(candidate.track - DIRECTORY_TRACK);
      const predictedSector = d64.estimateNextSectorWindow(
        previousBlock,
        candidate.track,
      );
      const sectorCount = d64.trackSectorCount(candidate.track);
      const rotationalDistance =
        previousBlock == null
          ? candidate.sector
          : (candidate.sector - predictedSector + sectorCount) % sectorCount;
      const score =
        seekDistance * 100 +
        rotationalDistance * 3 +
        (previousSide && candidateSide !== previousSide ? 180 : 0) +
        Math.abs(candidate.track - DIRECTORY_TRACK) * 2 +
        candidate.sector / 100;
      if (score < bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    return best;
  };

  d64.markAllocatedSector = function (allocation, block) {
    if (!block) return null;
    const sectorCount = d64.trackSectorCount(block.track);
    allocation.map[block.track] =
      allocation.map[block.track] || new Array(sectorCount).fill(true);
    allocation.map[block.track][block.sector] = false;
    return block;
  };

  d64.allocateSequentialSectors = function (count, allocation, options) {
    const result = [];
    const config = options || {};
    const preferredTrackOrder =
      config.preferredTrackOrder ||
      allocation.preferredTrackOrder ||
      d64.centerOutTrackOrder(allocation.trackCount);
    while (result.length < count) {
      const nextBlock =
        result.length === 0
          ? d64.findNextCenterOutStartSector(allocation, preferredTrackOrder)
          : d64.findNearestSmartSector(allocation, result[result.length - 1]);
      if (!nextBlock) break;
      d64.markAllocatedSector(allocation, nextBlock);
      result.push(nextBlock);
    }
    if (result.length) {
      const last = result[result.length - 1];
      allocation.track = last.track;
      allocation.sector = last.sector;
    }
    return result;
  };

  d64.allocateFragmentedSectors = function (count, allocation) {
    const result = [];
    const freePool = d64.collectAllocatableSectors(allocation);
    if (!freePool.length || count <= 0) return result;
    let stride = Math.max(
      2,
      Math.floor(Number(allocation.fragmentStride) || 29),
    );
    while (
      freePool.length > 1 &&
      d64.greatestCommonDivisor(stride, freePool.length) !== 1
    ) {
      stride += 1;
    }
    let cursor =
      Math.max(0, Math.floor(Number(allocation.fragmentCursor) || 0)) %
      freePool.length;
    const used = new Array(freePool.length).fill(false);
    const maxAttempts = freePool.length * 3;
    let attempts = 0;
    while (result.length < count && attempts < maxAttempts) {
      if (!used[cursor]) {
        const block = freePool[cursor];
        used[cursor] = true;
        allocation.map[block.track][block.sector] = false;
        result.push(block);
      }
      cursor = (cursor + stride) % freePool.length;
      attempts += 1;
    }
    if (result.length < count) {
      for (
        let index = 0;
        index < freePool.length && result.length < count;
        index += 1
      ) {
        if (used[index]) continue;
        const block = freePool[index];
        used[index] = true;
        allocation.map[block.track][block.sector] = false;
        result.push(block);
      }
    }
    allocation.fragmentCursor = cursor;
    return result;
  };

  d64.allocateSectors = function (count, allocation, options) {
    const mode = d64.normalizeAllocationMode(
      options && options.mode ? options.mode : allocation.mode,
    );
    if (mode === "fragmented") {
      return d64.allocateFragmentedSectors(count, allocation);
    }
    return d64.allocateSequentialSectors(count, allocation, options);
  };

  d64.writeFile = function (image, data, allocation, unusedTailData) {
    const bytes =
      data instanceof Uint8Array ? data : new Uint8Array(data || []);
    const sectors = Math.max(1, Math.ceil(bytes.length / 254));
    const blocks = d64.allocateSectors(sectors, allocation);
    if (blocks.length < sectors) return null;
    const normalizedUnusedTailData = d64.normalizeUnusedTailData(
      unusedTailData,
      Math.max(0, sectors * 254 - bytes.length),
    );
    for (let i = 0; i < sectors; i += 1) {
      const block = blocks[i];
      const nextBlock = blocks[i + 1];
      const offset = d64.trackOffset(block.track, block.sector);
      const sector = image.subarray(offset, offset + 256);
      const sliceStart = i * 254;
      const sliceEnd = sliceStart + 254;
      const chunk = bytes.subarray(sliceStart, sliceEnd);
      sector[0] = nextBlock ? nextBlock.track : 0;
      sector[1] = nextBlock ? nextBlock.sector : Math.max(1, chunk.length + 1);
      sector.set(chunk, 2);
      if (!nextBlock && normalizedUnusedTailData.length) {
        sector.set(normalizedUnusedTailData, 2 + chunk.length);
      }
    }
    return {
      startTrack: blocks[0].track,
      startSector: blocks[0].sector,
      sectorCount: sectors,
      unusedTailData: normalizedUnusedTailData,
    };
  };

  d64.createRelativeSideSector = function (
    sideBlocks,
    dataBlocks,
    sideSectorIndex,
    recordLength,
  ) {
    const sector = new Uint8Array(256);
    const nextBlock = sideBlocks[sideSectorIndex + 1];
    const currentDataBlocks = dataBlocks.slice(
      sideSectorIndex * REL_DATA_SECTORS_PER_SIDE_SECTOR,
      (sideSectorIndex + 1) * REL_DATA_SECTORS_PER_SIDE_SECTOR,
    );
    sector[0] = nextBlock ? nextBlock.track : 0;
    sector[1] = nextBlock ? nextBlock.sector : 0;
    sector[2] = sideSectorIndex & 0xff;
    sector[3] = d64.normalizeRecordLength(recordLength);
    for (let index = 0; index < REL_MAX_SIDE_SECTORS; index += 1) {
      const block = sideBlocks[index];
      sector[4 + index * 2] = block ? block.track : 0;
      sector[5 + index * 2] = block ? block.sector : 0;
    }
    currentDataBlocks.forEach(function (block, index) {
      const offset = 16 + index * 2;
      sector[offset] = block.track;
      sector[offset + 1] = block.sector;
    });
    return sector;
  };

  d64.writeRelativeFile = function (
    image,
    data,
    allocation,
    recordLength,
    unusedTailData,
  ) {
    const bytes =
      data instanceof Uint8Array ? data : new Uint8Array(data || []);
    const dataSectors = Math.max(1, Math.ceil(bytes.length / 254));
    const sideSectorCount = Math.max(
      1,
      Math.ceil(dataSectors / REL_DATA_SECTORS_PER_SIDE_SECTOR),
    );
    if (sideSectorCount > REL_MAX_SIDE_SECTORS) return null;
    const normalizedUnusedTailData = d64.normalizeUnusedTailData(
      unusedTailData,
      Math.max(0, dataSectors * 254 - bytes.length),
    );
    const dataBlocks = d64.allocateSectors(dataSectors, allocation);
    if (dataBlocks.length < dataSectors) return null;
    const sideBlocks = d64.allocateSectors(sideSectorCount, allocation);
    if (sideBlocks.length < sideSectorCount) return null;
    for (let i = 0; i < dataSectors; i += 1) {
      const block = dataBlocks[i];
      const nextBlock = dataBlocks[i + 1];
      const offset = d64.trackOffset(block.track, block.sector);
      const sector = image.subarray(offset, offset + 256);
      const sliceStart = i * 254;
      const sliceEnd = sliceStart + 254;
      const chunk = bytes.subarray(sliceStart, sliceEnd);
      sector[0] = nextBlock ? nextBlock.track : 0;
      sector[1] = nextBlock ? nextBlock.sector : Math.max(1, chunk.length + 1);
      sector.set(chunk, 2);
      if (!nextBlock && normalizedUnusedTailData.length) {
        sector.set(normalizedUnusedTailData, 2 + chunk.length);
      }
    }
    sideBlocks.forEach(function (block, index) {
      const offset = d64.trackOffset(block.track, block.sector);
      image.set(
        d64.createRelativeSideSector(
          sideBlocks,
          dataBlocks,
          index,
          recordLength,
        ),
        offset,
      );
    });
    return {
      startTrack: dataBlocks[0].track,
      startSector: dataBlocks[0].sector,
      sectorCount: dataSectors + sideSectorCount,
      sideSectorTrack: sideBlocks[0].track,
      sideSectorSector: sideBlocks[0].sector,
      recordLength: d64.normalizeRecordLength(recordLength),
      unusedTailData: normalizedUnusedTailData,
    };
  };

  d64.usableFileSectorCapacity = function () {
    const geometry = d64.describeGeometry(arguments[0]);
    let total = 0;
    for (let track = 1; track <= geometry.trackCount; track += 1) {
      if (track === 18) continue;
      total += d64.trackSectorCount(track);
    }
    return total;
  };

  d64.estimateImageUsage = function (files, options) {
    const geometry = d64.describeGeometry(options);
    const items = Array.isArray(files) ? files : [];
    const fileSectors = items.map(function (file) {
      return d64.prepareFileLayout(file).totalSectors;
    });
    const totalFileSectors = fileSectors.reduce(function (sum, count) {
      return sum + count;
    }, 0);
    const directorySectors = Math.max(1, Math.ceil(items.length / 8));
    return {
      totalFileSectors: totalFileSectors,
      directorySectors: directorySectors,
      usableFileSectors: d64.usableFileSectorCapacity(geometry),
      fileSectors: fileSectors,
    };
  };

  d64.planBuildOrder = function (files) {
    const items = (Array.isArray(files) ? files : []).map(
      function (file, index) {
        return {
          file: file,
          index: index,
          type: d64.decodeDirectoryEntryType(
            d64.normalizeFileType(file && file.type),
          ).fileType,
        };
      },
    );
    const firstPrgIndex = items.findIndex(function (item) {
      return item.type === "prg";
    });
    const getTier = function (item, index) {
      if (index === firstPrgIndex) return 0;
      if (item.type === "prg") return 1;
      if (item.type === "seq" || item.type === "usr") return 2;
      if (item.type === "rel") return 3;
      return 4;
    };
    return items
      .map(function (item, index) {
        return {
          item: item,
          tier: getTier(item, index),
          originalIndex: index,
        };
      })
      .sort(function (left, right) {
        if (left.tier !== right.tier) {
          return left.tier - right.tier;
        }
        return left.originalIndex - right.originalIndex;
      })
      .map(function (entry) {
        return entry.item;
      });
  };

  d64.finalizeImage = function (
    image,
    allocation,
    dirSectors,
    diskName,
    options,
  ) {
    const geometry = d64.describeGeometry(options || image);
    const freeMap = {};
    for (let track = 1; track <= geometry.trackCount; track += 1) {
      const sectorCount = d64.trackSectorCount(track);
      freeMap[track] = new Array(sectorCount).fill(true);
    }
    const track18Count = d64.trackSectorCount(18);
    for (const allocationTrack in allocation.map) {
      if (
        !Object.prototype.hasOwnProperty.call(allocation.map, allocationTrack)
      )
        continue;
      const trackIndex = Number(allocationTrack);
      freeMap[trackIndex] = allocation.map[trackIndex].slice();
    }
    const directorySectorOrder = Array.isArray(allocation.directorySectorOrder)
      ? allocation.directorySectorOrder.slice(0, dirSectors)
      : d64.buildDirectorySectorOrder(dirSectors, options || image);
    freeMap[18] = new Array(track18Count).fill(true);
    freeMap[18][0] = false;
    directorySectorOrder.forEach(function (sector) {
      if (sector >= 1 && sector < track18Count) {
        freeMap[18][sector] = false;
      }
    });
    const bamSector = d64.createBamSector(freeMap, diskName);
    image.set(bamSector, d64.trackOffset(18, 0));
    for (let index = 0; index < dirSectors; index += 1) {
      const targetSector = directorySectorOrder[index];
      if (!Number.isFinite(Number(targetSector))) continue;
      image.set(
        allocation.directorySectors[index],
        d64.trackOffset(18, targetSector),
      );
    }
  };

  d64.buildImage = function (files, options) {
    const config = options || {};
    const geometry = d64.describeGeometry(config);
    const estimate = d64.estimateImageUsage(files, geometry);
    if (estimate.totalFileSectors > estimate.usableFileSectors) return null;
    const image = new Uint8Array(geometry.imageSize);
    const diskInfo = d64.normalizeDiskInfo(config);
    const allocation = {
      track: 1,
      sector: 0,
      trackCount: geometry.trackCount,
      mode: d64.normalizeAllocationMode(config.allocationMode),
      fragmentStride: Math.max(
        2,
        Math.floor(Number(config.fragmentStride) || 29),
      ),
      fragmentCursor: Math.max(
        0,
        Math.floor(Number(config.fragmentCursor) || 0),
      ),
      map: {},
      directorySectors: [],
    };
    allocation.preferredTrackOrder = d64.centerOutTrackOrder(
      geometry.trackCount,
    );
    const directoryEntries = [];
    const fileRecords = new Array(files.length);
    const plannedFiles = d64.planBuildOrder(files);
    for (let i = 0; i < plannedFiles.length; i += 1) {
      const planned = plannedFiles[i];
      const file = planned.file;
      const layout = d64.prepareFileLayout(file);
      const fileRecord =
        layout.type === d64.fileTypes.rel
          ? d64.writeRelativeFile(
              image,
              layout.bytes,
              allocation,
              layout.recordLength,
              layout.unusedTailData,
            )
          : d64.writeFile(
              image,
              layout.bytes,
              allocation,
              layout.unusedTailData,
            );
      if (!fileRecord) return null;
      fileRecords[planned.index] = {
        layout: layout,
        fileRecord: fileRecord,
      };
    }
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const built = fileRecords[i];
      if (!built) return null;
      directoryEntries.push(
        d64.createDirectoryEntry(
          file.name,
          built.layout.type,
          built.fileRecord.startTrack,
          built.fileRecord.startSector,
          built.fileRecord.sectorCount,
          {
            closed: built.layout.closed,
            locked: built.layout.locked,
            sideSectorTrack: built.fileRecord.sideSectorTrack,
            sideSectorSector: built.fileRecord.sideSectorSector,
            recordLength: built.fileRecord.recordLength,
          },
        ),
      );
    }
    const entriesPerDirectorySector = 8;
    const dirSectors = Math.max(
      1,
      Math.ceil(directoryEntries.length / entriesPerDirectorySector),
    );
    if (dirSectors > d64.trackSectorCount(18) - 1) return null;
    allocation.directorySectorOrder = d64.buildDirectorySectorOrder(
      dirSectors,
      config,
    );
    for (let i = 0; i < dirSectors; i += 1) {
      allocation.directorySectors.push(
        d64.createDirectorySector(
          directoryEntries,
          i,
          dirSectors,
          allocation.directorySectorOrder,
        ),
      );
    }
    d64.finalizeImage(image, allocation, dirSectors, diskInfo, geometry);
    if (geometry.hasErrorInfo) {
      d64.writeErrorInfo(image, diskInfo.errorInfo, geometry);
    }
    return image;
  };

  d64.rebuildImage = function (image, files, options) {
    const header = d64.readHeader(image);
    const errorInfo = d64.readErrorInfo(image);
    const config = Object.assign(
      {
        diskName: header.diskName || DEFAULT_IMAGE_NAME,
        diskId: header.diskId || "TP",
        dosType: header.dosType || d64.dosTypes.dos2a,
        dosVersion: header.dosVersionByte || d64.dosVersions.dos2_6,
        format: header.format,
        trackCount: header.trackCount || DEFAULT_TRACK_COUNT,
        hasErrorInfo: header.hasErrorInfo === true,
        errorInfo: errorInfo.bytes,
      },
      options || {},
    );
    return d64.buildImage(files, config);
  };

  d64.composeImageWithDeleted = function (image, activeFiles, options) {
    const header = d64.readHeader(image);
    const errorInfo = d64.readErrorInfo(image);
    const config = Object.assign(
      {
        diskName: header.diskName || DEFAULT_IMAGE_NAME,
        diskId: header.diskId || "TP",
        dosType: header.dosType || d64.dosTypes.dos2a,
        dosVersion: header.dosVersionByte || d64.dosVersions.dos2_6,
        format: header.format,
        trackCount: header.trackCount || DEFAULT_TRACK_COUNT,
        hasErrorInfo: header.hasErrorInfo === true,
        errorInfo: errorInfo.bytes,
      },
      options || {},
    );
    const files = Array.isArray(activeFiles)
      ? activeFiles.slice()
      : d64.readFiles(image, options);
    const deletedPlans = d64.collectDeletedRebuildEntries(image, options);
    const activeEstimate = d64.estimateImageUsage(files, config);
    if (activeEstimate.totalFileSectors > activeEstimate.usableFileSectors) {
      return null;
    }
    const maxDirectoryEntries = (d64.trackSectorCount(18) - 1) * 8;
    let keptDeletedPlans = deletedPlans.slice();
    let keptDeletedSectors = keptDeletedPlans.reduce(function (sum, plan) {
      return sum + plan.totalSectors;
    }, 0);
    const requiredSectorRelease = Math.max(
      0,
      activeEstimate.totalFileSectors +
        keptDeletedSectors -
        activeEstimate.usableFileSectors,
    );
    const requiredSlotRelease = Math.max(
      0,
      files.length + keptDeletedPlans.length - maxDirectoryEntries,
    );
    if (requiredSectorRelease || requiredSlotRelease) {
      const dropped = d64.selectDeletedPlansToDrop(
        keptDeletedPlans,
        requiredSectorRelease,
        requiredSlotRelease,
      );
      if (!dropped) return null;
      keptDeletedPlans = keptDeletedPlans.filter(function (plan) {
        return !dropped[plan.entry.index];
      });
      keptDeletedSectors = keptDeletedPlans.reduce(function (sum, plan) {
        return sum + plan.totalSectors;
      }, 0);
    }
    if (
      activeEstimate.totalFileSectors + keptDeletedSectors >
      activeEstimate.usableFileSectors
    ) {
      return null;
    }
    const nextImage = d64.buildImage(files, config);
    if (!nextImage) return null;
    const builtActiveEntries = d64.readDirectoryEntries(nextImage);
    const allocation = d64.buildAllocationFromFreeMap(
      d64.readFreeMap(nextImage),
      config,
    );
    allocation.preferredTrackOrder = d64.outerInTrackOrder(config.trackCount);
    const directoryEntries = [];
    for (let index = 0; index < builtActiveEntries.length; index += 1) {
      directoryEntries.push(builtActiveEntries[index].raw.slice());
    }
    for (let index = 0; index < keptDeletedPlans.length; index += 1) {
      const plan = keptDeletedPlans[index];
      const layout = d64.prepareFileLayout(plan.file);
      const fileRecord =
        layout.type === d64.fileTypes.rel
          ? d64.writeRelativeFile(
              nextImage,
              layout.bytes,
              allocation,
              layout.recordLength,
              layout.unusedTailData,
            )
          : d64.writeFile(
              nextImage,
              layout.bytes,
              allocation,
              layout.unusedTailData,
            );
      if (!fileRecord) return null;
      directoryEntries.push(
        d64.createDeletedDirectoryEntry(
          plan.file.name,
          fileRecord.startTrack,
          fileRecord.startSector,
          fileRecord.sectorCount,
          {
            sideSectorTrack: fileRecord.sideSectorTrack,
            sideSectorSector: fileRecord.sideSectorSector,
            recordLength: fileRecord.recordLength,
          },
        ),
      );
    }
    const dirSectors = Math.max(1, Math.ceil(directoryEntries.length / 8));
    if (dirSectors > d64.trackSectorCount(18) - 1) return null;
    allocation.directorySectors = [];
    allocation.directorySectorOrder = d64.buildDirectorySectorOrder(
      dirSectors,
      config,
    );
    for (let index = 0; index < dirSectors; index += 1) {
      allocation.directorySectors.push(
        d64.createDirectorySector(
          directoryEntries,
          index,
          dirSectors,
          allocation.directorySectorOrder,
        ),
      );
    }
    d64.finalizeImage(nextImage, allocation, dirSectors, config, config);
    if (config.hasErrorInfo) {
      d64.writeErrorInfo(nextImage, config.errorInfo, config);
    }
    return nextImage;
  };

  d64.reflowImage = function (image, options) {
    return d64.composeImageWithDeleted(
      image,
      d64.readFiles(image, options),
      options,
    );
  };

  d64.defragmentImage = function (image, options) {
    return d64.reflowImage(
      image,
      Object.assign({}, options || {}, {
        allocationMode: "sequential",
      }),
    );
  };

  d64.fragmentImage = function (image, options) {
    const config = options || {};
    return d64.reflowImage(
      image,
      Object.assign({}, config, {
        allocationMode: "fragmented",
        fragmentStride: Math.max(
          2,
          Math.floor(Number(config.fragmentStride) || 29),
        ),
      }),
    );
  };

  d64.setDiskInfo = function (image, updates, options) {
    return d64.composeImageWithDeleted(
      image,
      d64.readFiles(image, options),
      updates,
    );
  };

  d64.setDiskName = function (image, diskName, options) {
    return d64.setDiskInfo(
      image,
      Object.assign({}, options || {}, { diskName: diskName }),
      options,
    );
  };

  d64.updateFile = function (image, entryOrName, updates, options) {
    const files = d64.readFiles(image, options);
    const targetName =
      typeof entryOrName === "string"
        ? String(entryOrName).trim().toUpperCase()
        : String((entryOrName && entryOrName.name) || "")
            .trim()
            .toUpperCase();
    const index = files.findIndex(function (file) {
      return (
        String(file.name || "")
          .trim()
          .toUpperCase() === targetName
      );
    });
    if (index < 0) {
      throw new Error("File not found: " + String(entryOrName || ""));
    }
    const patch = updates || {};
    const nextName = Object.prototype.hasOwnProperty.call(patch, "name")
      ? d64.normalizeFileName(patch.name, 16)
      : d64.normalizeFileName(files[index].name, 16);
    if (!nextName) {
      throw new Error("File name can not be empty.");
    }
    const duplicateIndex = files.findIndex(function (file, fileIndex) {
      if (fileIndex === index) return false;
      return d64.normalizeFileName(file.name, 16) === nextName;
    });
    if (duplicateIndex >= 0) {
      throw new Error("File already exists: " + nextName);
    }
    const metadataOnly =
      !Object.prototype.hasOwnProperty.call(patch, "data") &&
      !Object.prototype.hasOwnProperty.call(patch, "recordLength") &&
      !Object.prototype.hasOwnProperty.call(patch, "unusedTailData");
    const currentTypeName = String(files[index].type || "")
      .trim()
      .toLowerCase();
    const nextTypeName = Object.prototype.hasOwnProperty.call(patch, "type")
      ? d64.decodeDirectoryEntryType(d64.normalizeFileType(patch.type)).fileType
      : currentTypeName;
    if (
      metadataOnly &&
      !(currentTypeName === "rel" && nextTypeName !== "rel") &&
      !(currentTypeName !== "rel" && nextTypeName === "rel")
    ) {
      const entry = files[index].entry;
      const entryBytes = entry.raw.slice();
      entryBytes.set(d64.encodeFileName(nextName, 16), 5);
      entryBytes[2] = d64.encodeDirectoryEntryType(nextTypeName, {
        closed: Object.prototype.hasOwnProperty.call(patch, "closed")
          ? Boolean(patch.closed)
          : files[index].closed,
        locked: Object.prototype.hasOwnProperty.call(patch, "locked")
          ? Boolean(patch.locked)
          : files[index].locked,
      });
      return d64.writeDirectoryEntryBytes(image, entry, entryBytes);
    }
    files[index] = {
      name: nextName,
      type: Object.prototype.hasOwnProperty.call(patch, "type")
        ? patch.type
        : files[index].type,
      closed: Object.prototype.hasOwnProperty.call(patch, "closed")
        ? Boolean(patch.closed)
        : files[index].closed,
      locked: Object.prototype.hasOwnProperty.call(patch, "locked")
        ? Boolean(patch.locked)
        : files[index].locked,
      recordLength: Object.prototype.hasOwnProperty.call(patch, "recordLength")
        ? patch.recordLength
        : files[index].recordLength,
      data: Object.prototype.hasOwnProperty.call(patch, "data")
        ? patch.data instanceof Uint8Array
          ? patch.data
          : new Uint8Array(patch.data || [])
        : files[index].data,
      unusedTailData: Object.prototype.hasOwnProperty.call(
        patch,
        "unusedTailData",
      )
        ? patch.unusedTailData instanceof Uint8Array
          ? patch.unusedTailData
          : new Uint8Array(patch.unusedTailData || [])
        : files[index].unusedTailData,
    };
    return d64.composeImageWithDeleted(image, files, options);
  };

  d64.readUnusedTailData = function (image, entryOrName, options) {
    const file = d64.readFile(image, entryOrName, options);
    return file ? file.unusedTailData.slice() : null;
  };

  d64.hasUnusedTailData = function (image, entryOrName, options) {
    const file = d64.readFile(image, entryOrName, options);
    return Boolean(file && file.hasUnusedTailData);
  };

  d64.updateUnusedTailData = function (
    image,
    entryOrName,
    unusedTailData,
    options,
  ) {
    return d64.updateFile(
      image,
      entryOrName,
      {
        unusedTailData: unusedTailData,
      },
      options,
    );
  };

  d64.clearUnusedTailData = function (image, entryOrName, options) {
    const file = d64.readFile(image, entryOrName, options);
    if (!file) {
      throw new Error("File not found: " + String(entryOrName || ""));
    }
    return d64.updateUnusedTailData(
      image,
      entryOrName,
      new Uint8Array(file.unusedTailLength),
      options,
    );
  };

  d64.renameFile = function (image, entryOrName, newName, options) {
    return d64.updateFile(
      image,
      entryOrName,
      {
        name: newName,
      },
      options,
    );
  };

  d64.lockFile = function (image, entryOrName, options) {
    return d64.updateFile(
      image,
      entryOrName,
      {
        locked: true,
      },
      options,
    );
  };

  d64.unlockFile = function (image, entryOrName, options) {
    return d64.updateFile(
      image,
      entryOrName,
      {
        locked: false,
      },
      options,
    );
  };

  d64.closeFile = function (image, entryOrName, options) {
    return d64.updateFile(
      image,
      entryOrName,
      {
        closed: true,
      },
      options,
    );
  };

  d64.openFile = function (image, entryOrName, options) {
    return d64.updateFile(
      image,
      entryOrName,
      {
        closed: false,
      },
      options,
    );
  };

  d64.deleteFile = function (image, entryOrName, options) {
    const files = d64.readFiles(image, options);
    const targetName =
      typeof entryOrName === "string"
        ? String(entryOrName).trim().toUpperCase()
        : String((entryOrName && entryOrName.name) || "")
            .trim()
            .toUpperCase();
    const filtered = files.filter(function (file) {
      return (
        String(file.name || "")
          .trim()
          .toUpperCase() !== targetName
      );
    });
    if (filtered.length === files.length) {
      throw new Error("File not found: " + String(entryOrName || ""));
    }
    return d64.composeImageWithDeleted(image, filtered, options);
  };

  d64.addFile = function (image, file, options) {
    const files = d64.readFiles(image, options);
    const nextFile = file || {};
    const targetName = d64.normalizeFileName(nextFile.name, 16);
    if (!targetName) {
      throw new Error("New file must have a name.");
    }
    const existingIndex = files.findIndex(function (entry) {
      return (
        String(entry.name || "")
          .trim()
          .toUpperCase() === targetName
      );
    });
    if (existingIndex >= 0) {
      throw new Error("File already exists: " + String(nextFile.name || ""));
    }
    files.push({
      name: targetName,
      type: Object.prototype.hasOwnProperty.call(nextFile, "type")
        ? nextFile.type
        : "prg",
      closed: nextFile.closed !== false,
      locked: Boolean(nextFile.locked),
      recordLength: nextFile.recordLength,
      data:
        nextFile.data instanceof Uint8Array
          ? nextFile.data
          : new Uint8Array(nextFile.data || []),
      unusedTailData:
        nextFile.unusedTailData instanceof Uint8Array
          ? nextFile.unusedTailData
          : new Uint8Array(nextFile.unusedTailData || []),
    });
    return d64.composeImageWithDeleted(image, files, options);
  };

  d64.fileName = function (options) {
    const config = options || {};
    const rawBaseName =
      config.baseName ||
      config.name ||
      config.diskName ||
      config.title ||
      DEFAULT_IMAGE_NAME;
    const safeBaseName =
      String(rawBaseName || DEFAULT_IMAGE_NAME)
        .trim()
        .replace(/[^A-Za-z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "") || DEFAULT_IMAGE_NAME;
    return safeBaseName.replace(/\.d64$/i, "") + ".d64";
  };

  d64.diskFileName = function (options, diskNumber, totalDisks) {
    const base = d64.fileName(options).replace(/\.d64$/i, "");
    const suffix =
      "-disk" +
      String(diskNumber).padStart(2, "0") +
      "-of-" +
      String(totalDisks).padStart(2, "0") +
      ".d64";
    return base + suffix;
  };
})();
