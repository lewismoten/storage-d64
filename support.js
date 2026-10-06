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
    null: 0x00,
    dos2_6: 0x41,
    dos8050_8250: 0x43,
    dos1581: 0x44,
  });

  d64.dosTypes = Object.freeze({
    dos2a: "2A",
    dos2c: "2C",
    dos3d: "3D",
  });

  d64.dosTypeInfo = Object.freeze({
    "2A": Object.freeze({
      code: "2A",
      label: "2A",
      description: "Standard 1541-style CBM DOS disk",
      is1541Valid: true,
    }),
    "2C": Object.freeze({
      code: "2C",
      label: "2C",
      description: "Higher-capacity CBM 8050/8250-style family",
      is1541Valid: false,
    }),
    "3D": Object.freeze({
      code: "3D",
      label: "3D",
      description: "1581 3.5-inch disk format",
      is1541Valid: false,
    }),
  });

  d64.dosVersionInfo = Object.freeze({
    0: Object.freeze({
      key: "null",
      code: 0x00,
      ascii: "NUL",
      label: "Null",
      description: "Null or tolerated special-case DOS version byte",
      is1541Valid: true,
      isPreferred1541: false,
    }),
    65: Object.freeze({
      key: "dos2_6",
      code: 0x41,
      ascii: "A",
      label: "1541 / D64",
      description: "1541 / D64 DOS version byte",
      is1541Valid: true,
      isPreferred1541: true,
    }),
    67: Object.freeze({
      key: "dos8050_8250",
      code: 0x43,
      ascii: "C",
      label: "8050 / 8250",
      description: "8050 / 8250 DOS version byte",
      is1541Valid: false,
      isPreferred1541: false,
    }),
    68: Object.freeze({
      key: "dos1581",
      code: 0x44,
      ascii: "D",
      label: "1581 / D81",
      description: "1581 / D81 DOS version byte",
      is1541Valid: false,
      isPreferred1541: false,
    }),
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

  d64.isAllowedDiskNameByte = function (value) {
    const byte = Math.max(0, Math.min(255, Number(value) || 0));
    if (byte === 0x00 || byte === 0x20 || byte === 0xa0) return true;
    const char = String.fromCharCode(byte & 0xff);
    return /^[A-Z0-9 !"#$%&'()*+\-./:;<=>?@]$/.test(char);
  };

  d64.normalizeDiskNameFieldBytes = function (bytes, options) {
    const config = options || {};
    const length = Math.max(1, Math.floor(Number(config.length) || 16));
    const source =
      bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const result = new Uint8Array(length).fill(0xa0);
    for (let index = 0; index < length; index += 1) {
      const value = source[index];
      if (value == null) break;
      if (value === 0x00 || value === 0x20 || value === 0xa0) {
        result[index] = 0xa0;
        continue;
      }
      result[index] = d64.isAllowedDiskNameByte(value) ? value : 0xa0;
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
    if (!value) return d64.dosTypes.dos2a;
    return d64.dosTypeInfo[value] ? value : d64.dosTypes.dos2a;
  };

  d64.readStoredDosType = function (dosType) {
    return String(dosType || "")
      .trim()
      .toUpperCase();
  };

  d64.isValid1541DosType = function (dosType) {
    const stored = d64.readStoredDosType(dosType);
    const info = d64.dosTypeInfo[stored];
    return Boolean(info && info.is1541Valid);
  };

  d64.describeDosType = function (dosType) {
    const stored = d64.readStoredDosType(dosType);
    return d64.dosTypeInfo[stored] || null;
  };

  d64.normalizeDosVersion = function (dosVersion) {
    if (typeof dosVersion === "number" && Number.isFinite(dosVersion)) {
      return Math.max(0, Math.min(255, Math.round(dosVersion)));
    }
    const value = String(dosVersion || "").trim();
    if (/^0x[0-9a-f]{1,2}$/i.test(value)) {
      return parseInt(value, 16) & 0xff;
    }
    if (/^[0-9a-f]{2}$/i.test(value)) {
      return parseInt(value, 16) & 0xff;
    }
    if (value.length === 1) {
      return value.toUpperCase().charCodeAt(0) & 0xff;
    }
    const key = value.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(d64.dosVersions, key)) {
      return d64.dosVersions[key];
    }
    return d64.dosVersions.dos2_6;
  };

  d64.describeDosVersion = function (dosVersion) {
    const code =
      typeof dosVersion === "number" && Number.isFinite(dosVersion)
        ? Math.max(0, Math.min(255, Math.round(dosVersion)))
        : d64.normalizeDosVersion(dosVersion);
    return d64.dosVersionInfo[code] || null;
  };

  d64.isExpected1541DosVersion = function (dosVersion) {
    const info = d64.describeDosVersion(dosVersion);
    return Boolean(info && info.is1541Valid);
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
      dosVersionName: d64.describeDosVersion(sector[offsets.dosVersion])
        ? d64.describeDosVersion(sector[offsets.dosVersion]).key
        : "unknown",
      dosVersionLabel: d64.describeDosVersion(sector[offsets.dosVersion])
        ? d64.describeDosVersion(sector[offsets.dosVersion]).label
        : "0x" +
          sector[offsets.dosVersion]
            .toString(16)
            .toUpperCase()
            .padStart(2, "0"),
      dosVersionDescription: d64.describeDosVersion(sector[offsets.dosVersion])
        ? d64.describeDosVersion(sector[offsets.dosVersion]).description
        : "",
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
    const hasAnyNonZeroByte = bytes.some(function (value) {
      return value !== 0;
    });
    if (!hasAnyNonZeroByte) {
      return {
        confidence: 0,
        looksLikeBam: false,
        validTrackEntries: 0,
        invalidTrackEntries: 0,
        nonZeroTrackEntries: 0,
        zeroTrackEntries: DEFAULT_TRACK_COUNT,
        plausibleTrackEntries: 0,
        hasRecognizedDosVersion: false,
        hasExpectedDosType: false,
        hasStrongHeaderIdentity: false,
        hasHeaderSignal: false,
        dosVersionByte: 0,
        nextDirectoryTrack: 0,
        nextDirectorySector: 0,
        diskName: "",
        diskId: "",
        dosType: "",
        directoryPointerLooksValid: true,
      };
    }
    let validTrackEntries = 0;
    let invalidTrackEntries = 0;
    let nonZeroTrackEntries = 0;
    let zeroTrackEntries = 0;
    for (let track = 1; track <= DEFAULT_TRACK_COUNT; track += 1) {
      const bamOffset = d64.headerOffsets.bamStart + (track - 1) * 4;
      const sectorCount = d64.trackSectorCount(track);
      const freeCount = bytes[bamOffset];
      const bit0 = bytes[bamOffset + 1];
      const bit1 = bytes[bamOffset + 2];
      const bit2 = bytes[bamOffset + 3];
      const hasTrackEntrySignal = Boolean(freeCount || bit0 || bit1 || bit2);
      if (hasTrackEntrySignal) {
        nonZeroTrackEntries += 1;
      } else {
        zeroTrackEntries += 1;
        continue;
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
    const dosVersionInfo = d64.describeDosVersion(dosVersionByte);
    const hasRecognizedDosVersion = Boolean(
      dosVersionInfo && dosVersionInfo.code !== d64.dosVersions.null,
    );
    const isReadableIdentityValue = function (value) {
      const text = String(value || "");
      if (!text) return false;
      return /^[A-Z0-9 !"#$%&'()*+\-./:;<=>?@]+$/.test(text);
    };
    const hasReadableIdentity =
      isReadableIdentityValue(diskName) ||
      isReadableIdentityValue(diskId) ||
      isReadableIdentityValue(dosType);
    const hasExpectedDosType = d64.isValid1541DosType(dosType);
    const hasStrongHeaderIdentity =
      hasRecognizedDosVersion || hasExpectedDosType || hasReadableIdentity;
    const directoryPointerLooksValid =
      nextDirectoryTrack === 0 ||
      (nextDirectoryTrack <= MAX_TRACK_COUNT &&
        nextDirectorySector <
          d64.trackSectorCount(Math.max(1, nextDirectoryTrack)));
    const hasHeaderSignal =
      hasRecognizedDosVersion ||
      hasReadableIdentity ||
      hasExpectedDosType ||
      nonZeroTrackEntries >= 6;
    const plausibleTrackEntries =
      validTrackEntries + (hasStrongHeaderIdentity ? zeroTrackEntries : 0);
    let confidence = 0;
    if (validTrackEntries >= 24) confidence += 3;
    else if (validTrackEntries >= 12) confidence += 2;
    else if (validTrackEntries >= 6) confidence += 1;
    if (hasRecognizedDosVersion) confidence += 2;
    if (hasReadableIdentity) confidence += 1;
    if (hasExpectedDosType) confidence += 1;
    if (directoryPointerLooksValid) confidence += 1;
    if (nonZeroTrackEntries >= 20) confidence += 1;
    if (
      hasStrongHeaderIdentity &&
      invalidTrackEntries === 0 &&
      plausibleTrackEntries >= DEFAULT_TRACK_COUNT
    ) {
      confidence += 2;
    }
    if (invalidTrackEntries > 10) confidence -= 2;
    if (config.requireScore && confidence < config.requireScore) return null;
    return {
      confidence: confidence,
      looksLikeBam:
        hasHeaderSignal &&
        confidence >= 4 &&
        (validTrackEntries >= 6 ||
          (hasStrongHeaderIdentity &&
            invalidTrackEntries === 0 &&
            plausibleTrackEntries >= DEFAULT_TRACK_COUNT)),
      validTrackEntries: validTrackEntries,
      invalidTrackEntries: invalidTrackEntries,
      nonZeroTrackEntries: nonZeroTrackEntries,
      zeroTrackEntries: zeroTrackEntries,
      plausibleTrackEntries: plausibleTrackEntries,
      hasRecognizedDosVersion: hasRecognizedDosVersion,
      hasExpectedDosType: hasExpectedDosType,
      hasStrongHeaderIdentity: hasStrongHeaderIdentity,
      hasHeaderSignal: hasHeaderSignal,
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
      let file = null;
      let readError = "";
      try {
        file = d64.readFile(image, entry, options);
      } catch (error) {
        readError = String(error && error.message ? error.message : error);
      }
      return {
        name: entry.name,
        type: entry.fileType,
        closed: entry.closed,
        locked: entry.locked,
        recordLength: entry.recordLength || undefined,
        data: file ? file.payload.slice() : new Uint8Array(0),
        unusedTailData: file ? file.unusedTailData.slice() : new Uint8Array(0),
        readError: readError,
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

  d64.collectFileSectorRefsBestEffort = function (image, entry, options) {
    if (!entry || !entry.startTrack) {
      return {
        refs: [],
        partial: false,
        stoppedReason: "",
      };
    }
    const config = options || {};
    const geometry = d64.describeGeometry(image);
    const refs = [];
    const visited = {};
    const blockedKeys = {};
    const currentEntryIndex = String(entry.index != null ? entry.index : "");
    const addBlockedRefs = function (entries, entryOptions) {
      (Array.isArray(entries) ? entries : []).forEach(function (other) {
        if (!other) return;
        if (
          currentEntryIndex &&
          String(other.index != null ? other.index : "") === currentEntryIndex
        ) {
          return;
        }
        try {
          d64
            .collectFileSectorRefs(image, other, entryOptions)
            .forEach(function (ref) {
              blockedKeys[String(ref.track) + ":" + String(ref.sector)] = true;
            });
        } catch (error) {
          // Ignore other corrupt chains here. Best-effort scratch only blocks
          // sectors we can positively attribute to another entry.
        }
      });
    };
    addBlockedRefs(d64.readDirectoryEntries(image, config), config);
    addBlockedRefs(d64.readDeletedEntries(image, config), config);

    const isValidAddress = function (track, sector) {
      const safeTrack = Math.max(0, Math.floor(Number(track) || 0));
      const safeSector = Math.max(0, Math.floor(Number(sector) || 0));
      return (
        safeTrack >= 1 &&
        safeTrack <= d64.normalizeTrackCount(geometry.trackCount) &&
        safeSector >= 0 &&
        safeSector < d64.trackSectorCount(safeTrack)
      );
    };

    let track = Math.max(0, Math.floor(Number(entry.startTrack) || 0));
    let sector = Math.max(0, Math.floor(Number(entry.startSector) || 0));
    let stoppedReason = "";

    while (track) {
      if (!isValidAddress(track, sector)) {
        stoppedReason = "invalid-pointer";
        break;
      }
      const key = String(track) + ":" + String(sector);
      if (visited[key]) {
        stoppedReason = "loop";
        break;
      }
      if (blockedKeys[key]) {
        stoppedReason = "crossed-other-chain";
        break;
      }
      visited[key] = true;
      refs.push({ track: track, sector: sector });
      const block = d64.readSector(image, track, sector);
      const nextTrack = block[0];
      const nextSector = block[1];
      if (!nextTrack) {
        break;
      }
      if (!isValidAddress(nextTrack, nextSector)) {
        stoppedReason = "invalid-pointer";
        break;
      }
      const nextKey = String(nextTrack) + ":" + String(nextSector);
      if (visited[nextKey]) {
        stoppedReason = "loop";
        break;
      }
      if (blockedKeys[nextKey]) {
        stoppedReason = "crossed-other-chain";
        break;
      }
      track = nextTrack;
      sector = nextSector;
    }

    if (
      String(entry.fileType || "").toLowerCase() === "rel" &&
      entry.sideSectorTrack
    ) {
      try {
        d64
          .readRelativeSideSectors(
            image,
            entry.sideSectorTrack,
            entry.sideSectorSector,
          )
          .forEach(function (sideSector) {
            const key =
              String(sideSector.track) + ":" + String(sideSector.sector);
            if (!blockedKeys[key] && !visited[key]) {
              refs.push({
                track: sideSector.track,
                sector: sideSector.sector,
              });
            }
          });
      } catch (error) {
        if (!stoppedReason) {
          stoppedReason = "side-sector-error";
        }
      }
    }

    return {
      refs: refs,
      partial: Boolean(stoppedReason),
      stoppedReason: stoppedReason,
    };
  };

  d64.collectRawFileSectorRefsBestEffort = function (image, entry) {
    if (!entry || !entry.startTrack) {
      return {
        refs: [],
        partial: false,
        stoppedReason: "",
      };
    }
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    const geometry = d64.describeGeometry(bytes);
    const refs = [];
    const visited = {};
    const isValidAddress = function (track, sector) {
      const safeTrack = Math.max(0, Math.floor(Number(track) || 0));
      const safeSector = Math.max(0, Math.floor(Number(sector) || 0));
      return (
        safeTrack >= 1 &&
        safeTrack <= d64.normalizeTrackCount(geometry.trackCount) &&
        safeSector >= 0 &&
        safeSector < d64.trackSectorCount(safeTrack)
      );
    };

    let track = Math.max(0, Math.floor(Number(entry.startTrack) || 0));
    let sector = Math.max(0, Math.floor(Number(entry.startSector) || 0));
    let stoppedReason = "";

    while (track) {
      if (!isValidAddress(track, sector)) {
        stoppedReason = "invalid-pointer";
        break;
      }
      const key = String(track) + ":" + String(sector);
      if (visited[key]) {
        stoppedReason = "loop";
        break;
      }
      visited[key] = true;
      refs.push({ track: track, sector: sector });
      const block = d64.readSector(bytes, track, sector);
      const nextTrack = block[0];
      const nextSector = block[1];
      if (!nextTrack) {
        break;
      }
      if (!isValidAddress(nextTrack, nextSector)) {
        stoppedReason = "invalid-pointer";
        break;
      }
      track = nextTrack;
      sector = nextSector;
    }

    return {
      refs: refs,
      partial: Boolean(stoppedReason),
      stoppedReason: stoppedReason,
    };
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

  d64.scratchFileWithReport = function (image, entryOrName, options) {
    const entry =
      typeof entryOrName === "string"
        ? d64.findDirectoryEntryByName(image, entryOrName, options)
        : entryOrName || null;
    if (!entry) {
      throw new Error("File not found: " + String(entryOrName || ""));
    }
    const freeMap = d64.readFreeMap(image);
    const sectorRefs = d64.collectFileSectorRefsBestEffort(
      image,
      entry,
      options,
    );
    d64.updateFreeMapSectors(freeMap, sectorRefs.refs, true);
    const entryBytes = entry.raw.slice();
    entryBytes[2] = 0x00;
    const withDeletedEntry = d64.writeDirectoryEntryBytes(
      image,
      entry,
      entryBytes,
    );
    return {
      image: d64.writeBamFreeMap(withDeletedEntry, freeMap),
      partial: Boolean(sectorRefs.partial),
      stoppedReason: String(sectorRefs.stoppedReason || ""),
      freedSectors: Array.isArray(sectorRefs.refs) ? sectorRefs.refs.length : 0,
    };
  };

  d64.scratchFile = function (image, entryOrName, options) {
    return d64.scratchFileWithReport(image, entryOrName, options).image;
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
    const restoredName = d64.normalizeFileName(
      Object.prototype.hasOwnProperty.call(options, "name")
        ? options.name
        : entry.name,
      16,
    );
    if (!restoredName) {
      throw new Error("A restore file name must be chosen.");
    }
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
    entryBytes.set(d64.encodeFileName(restoredName, 16), 5);
    const withRestoredEntry = d64.writeDirectoryEntryBytes(
      image,
      entry,
      entryBytes,
    );
    return d64.writeBamFreeMap(withRestoredEntry, freeMap);
  };

  d64.destroyDeletedFileWithReport = function (
    image,
    deletedEntryOrName,
    options,
  ) {
    const config = options || {};
    const deletedEntries = d64.readDeletedEntries(image, config);
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

    const inferredDeletedType = entry.sideSectorTrack ? "rel" : "prg";
    const targetRefs = d64.collectFileSectorRefsBestEffort(image, entry, {
      restoredType: inferredDeletedType,
    });
    const bytes =
      image instanceof Uint8Array ? image.slice() : new Uint8Array(image || []);
    targetRefs.refs.forEach(function (ref) {
      bytes.fill(
        0,
        d64.trackOffset(ref.track, ref.sector),
        d64.trackOffset(ref.track, ref.sector) + 256,
      );
    });
    const clearedEntry = new Uint8Array(32);
    return {
      image: d64.writeDirectoryEntryBytes(bytes, entry, clearedEntry),
      partial: Boolean(targetRefs.partial),
      stoppedReason: String(targetRefs.stoppedReason || ""),
      clearedSectors: Array.isArray(targetRefs.refs)
        ? targetRefs.refs.length
        : 0,
    };
  };

  d64.destroyDeletedFile = function (image, deletedEntryOrName, options) {
    return d64.destroyDeletedFileWithReport(image, deletedEntryOrName, options)
      .image;
  };

  d64.truncateBrokenFileChainWithReport = function (
    image,
    entryOrName,
    options,
  ) {
    const config = options || {};
    const entry =
      typeof entryOrName === "string"
        ? d64.findDirectoryEntryByName(image, entryOrName, config)
        : entryOrName || null;
    if (!entry || !entry.typeByte || entry.deleted) {
      throw new Error("File not found: " + String(entryOrName || ""));
    }
    const bytes =
      image instanceof Uint8Array ? image.slice() : new Uint8Array(image || []);
    const geometry = d64.describeGeometry(bytes);
    const isValidAddress = function (track, sector) {
      const safeTrack = Math.max(0, Math.floor(Number(track) || 0));
      const safeSector = Math.max(0, Math.floor(Number(sector) || 0));
      return (
        safeTrack >= 1 &&
        safeTrack <= geometry.trackCount &&
        safeSector >= 0 &&
        safeSector < d64.trackSectorCount(safeTrack)
      );
    };
    let track = Math.max(0, Math.floor(Number(entry.startTrack) || 0));
    let sector = Math.max(0, Math.floor(Number(entry.startSector) || 0));
    const visited = {};
    while (track) {
      if (!isValidAddress(track, sector)) {
        throw new Error("File does not reach a valid sector to truncate.");
      }
      const key = String(track) + ":" + String(sector);
      if (visited[key]) {
        throw new Error("File chain loops before the invalid pointer.");
      }
      visited[key] = true;
      const block = d64.readSector(bytes, track, sector);
      const nextTrack = block[0];
      const nextSector = block[1];
      if (!nextTrack) {
        return {
          image: bytes,
          truncated: false,
          track: track,
          sector: sector,
        };
      }
      if (!isValidAddress(nextTrack, nextSector)) {
        block[0] = 0;
        block[1] = 255;
        return {
          image: bytes,
          truncated: true,
          track: track,
          sector: sector,
          invalidNextTrack: nextTrack,
          invalidNextSector: nextSector,
        };
      }
      track = nextTrack;
      sector = nextSector;
    }
    throw new Error("File has no valid start block to truncate.");
  };

  d64.truncateBrokenFileChain = function (image, entryOrName, options) {
    return d64.truncateBrokenFileChainWithReport(image, entryOrName, options)
      .image;
  };

  d64.truncateCircularFileChainWithReport = function (
    image,
    entryOrName,
    options,
  ) {
    const config = options || {};
    const entry =
      typeof entryOrName === "string"
        ? d64.findDirectoryEntryByName(image, entryOrName, config)
        : entryOrName || null;
    if (!entry || !entry.typeByte || entry.deleted) {
      throw new Error("File not found: " + String(entryOrName || ""));
    }
    const bytes =
      image instanceof Uint8Array ? image.slice() : new Uint8Array(image || []);
    const geometry = d64.describeGeometry(bytes);
    const isValidAddress = function (track, sector) {
      const safeTrack = Math.max(0, Math.floor(Number(track) || 0));
      const safeSector = Math.max(0, Math.floor(Number(sector) || 0));
      return (
        safeTrack >= 1 &&
        safeTrack <= geometry.trackCount &&
        safeSector >= 0 &&
        safeSector < d64.trackSectorCount(safeTrack)
      );
    };
    let track = Math.max(0, Math.floor(Number(entry.startTrack) || 0));
    let sector = Math.max(0, Math.floor(Number(entry.startSector) || 0));
    const visited = {};
    let previousTrack = 0;
    let previousSector = 0;
    while (track) {
      if (!isValidAddress(track, sector)) {
        throw new Error("File does not reach a valid sector to truncate.");
      }
      const key = String(track) + ":" + String(sector);
      if (visited[key]) {
        if (!previousTrack) {
          throw new Error("File loops at its starting sector.");
        }
        const previousBlock = d64.readSector(
          bytes,
          previousTrack,
          previousSector,
        );
        previousBlock[0] = 0;
        previousBlock[1] = 255;
        return {
          image: bytes,
          truncated: true,
          track: previousTrack,
          sector: previousSector,
          loopTrack: track,
          loopSector: sector,
        };
      }
      visited[key] = true;
      const block = d64.readSector(bytes, track, sector);
      const nextTrack = block[0];
      const nextSector = block[1];
      if (!nextTrack) {
        return {
          image: bytes,
          truncated: false,
          track: track,
          sector: sector,
        };
      }
      previousTrack = track;
      previousSector = sector;
      track = nextTrack;
      sector = nextSector;
    }
    throw new Error("File has no valid start block to truncate.");
  };

  d64.truncateCircularFileChain = function (image, entryOrName, options) {
    return d64.truncateCircularFileChainWithReport(image, entryOrName, options)
      .image;
  };

  d64.repairUnreachableDirectoryEntryWithReport = function (
    image,
    entryOrIndex,
    options,
  ) {
    const config = options || {};
    const bytes =
      image instanceof Uint8Array ? image.slice() : new Uint8Array(image || []);
    const entry =
      typeof entryOrIndex === "number"
        ? d64.readDirectoryEntry(bytes, entryOrIndex)
        : entryOrIndex || null;
    if (!entry || !entry.typeByte || entry.deleted) {
      throw new Error("Active directory entry not found.");
    }
    const entryLocationKey =
      String(Math.max(0, Math.floor(Number(entry.track) || 0))) +
      ":" +
      String(Math.max(0, Math.floor(Number(entry.sector) || 0))) +
      ":" +
      String(Math.max(0, Math.floor(Number(entry.slot) || 0)));
    const header = d64.readHeader(bytes);
    const directory = d64.readDirectoryEntriesFrom(
      bytes,
      header.nextDirectoryTrack,
      header.nextDirectorySector,
      Object.assign({}, config, { includeDeleted: true }),
    );
    const reachableLocations = {};
    directory.entries.forEach(function (candidate) {
      const locationKey =
        String(Math.max(0, Math.floor(Number(candidate.track) || 0))) +
        ":" +
        String(Math.max(0, Math.floor(Number(candidate.sector) || 0))) +
        ":" +
        String(Math.max(0, Math.floor(Number(candidate.slot) || 0)));
      reachableLocations[locationKey] = true;
    });
    if (reachableLocations[entryLocationKey]) {
      return {
        image: bytes,
        repaired: false,
        mode: "already-reachable",
        targetTrack: entry.track,
        targetSector: entry.sector,
        targetSlot: entry.slot,
      };
    }

    const isAllZeroEntry = function (entryBytes) {
      for (let index = 0; index < 32; index += 1) {
        if (entryBytes[index]) return false;
      }
      return true;
    };

    let target = null;
    directory.sectors.some(function (sectorInfo) {
      const sectorBytes = d64.readSector(
        bytes,
        sectorInfo.track,
        sectorInfo.sector,
      );
      for (let slot = 0; slot < 8; slot += 1) {
        const offset = slot * 32;
        const entryBytes = sectorBytes.subarray(offset, offset + 32);
        if (!isAllZeroEntry(entryBytes)) continue;
        target = {
          track: sectorInfo.track,
          sector: sectorInfo.sector,
          slot: slot,
          mode: "slot",
        };
        return true;
      }
      return false;
    });

    const freeMap = d64.readFreeMap(bytes);
    if (!target) {
      const usedDirectorySectors = directory.sectors.map(function (sectorInfo) {
        return sectorInfo.sector;
      });
      const lastSectorInfo = directory.sectors[directory.sectors.length - 1];
      const nextSector = d64.findNextDirectoryInterleaveSector(
        lastSectorInfo ? lastSectorInfo.sector : DIRECTORY_START_SECTOR,
        usedDirectorySectors,
      );
      if (
        Number.isFinite(Number(nextSector)) &&
        freeMap[DIRECTORY_TRACK] &&
        freeMap[DIRECTORY_TRACK][nextSector] === true
      ) {
        target = {
          track: DIRECTORY_TRACK,
          sector: Math.floor(Number(nextSector)),
          slot: 0,
          mode: "new-sector",
          previousSector: lastSectorInfo ? lastSectorInfo.sector : null,
        };
      }
    }

    if (!target) {
      throw new Error("No reachable directory slot is available for repair.");
    }

    let nextImage = bytes.slice();
    if (target.mode === "new-sector") {
      const newSectorBytes = new Uint8Array(SECTOR_SIZE);
      newSectorBytes[0] = 0;
      newSectorBytes[1] = 255;
      newSectorBytes.set(entry.raw.slice(0, 32), 0);
      nextImage.set(
        newSectorBytes,
        d64.trackOffset(DIRECTORY_TRACK, target.sector),
      );
      const previousSectorBytes = d64
        .readSector(nextImage, DIRECTORY_TRACK, target.previousSector)
        .slice();
      previousSectorBytes[0] = DIRECTORY_TRACK;
      previousSectorBytes[1] = target.sector;
      nextImage.set(
        previousSectorBytes,
        d64.trackOffset(DIRECTORY_TRACK, target.previousSector),
      );
      freeMap[DIRECTORY_TRACK][target.sector] = false;
      nextImage = d64.writeBamFreeMap(nextImage, freeMap);
    } else {
      const targetSectorBytes = d64
        .readSector(nextImage, target.track, target.sector)
        .slice();
      targetSectorBytes.set(entry.raw.slice(0, 32), target.slot * 32);
      nextImage.set(
        targetSectorBytes,
        d64.trackOffset(target.track, target.sector),
      );
    }

    const clearedEntry = new Uint8Array(32);
    nextImage = d64.writeDirectoryEntryBytes(nextImage, entry, clearedEntry);
    return {
      image: nextImage,
      repaired: true,
      mode: target.mode,
      targetTrack: target.track,
      targetSector: target.sector,
      targetSlot: target.slot,
      sourceTrack: entry.track,
      sourceSector: entry.sector,
      sourceSlot: entry.slot,
    };
  };

  d64.repairUnreachableDirectoryEntry = function (
    image,
    entryOrIndex,
    options,
  ) {
    return d64.repairUnreachableDirectoryEntryWithReport(
      image,
      entryOrIndex,
      options,
    ).image;
  };

  d64.analyzeReservedTrackFileRepair = function (image, entryOrName, options) {
    const config = options || {};
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    const entry =
      typeof entryOrName === "string"
        ? d64.findDirectoryEntryByName(bytes, entryOrName, config)
        : typeof entryOrName === "number"
          ? d64.readDirectoryEntry(bytes, entryOrName)
          : entryOrName || null;
    if (!entry || !entry.typeByte || entry.deleted) {
      throw new Error("Active file not found: " + String(entryOrName || ""));
    }
    const chain = d64.collectRawFileSectorRefsBestEffort(bytes, entry);
    const reservedRefs = chain.refs.filter(function (ref) {
      return ref.track === DIRECTORY_TRACK;
    });

    let disabledReason = "";
    if (!reservedRefs.length) {
      disabledReason = "This file does not currently use the reserved directory track.";
    }
    const firstReservedIndex = reservedRefs.length
      ? chain.refs.findIndex(function (ref) {
          return ref.track === DIRECTORY_TRACK;
        })
      : -1;

    return {
      entry: entry,
      entryIndex: entry.index,
      fileName: entry.name,
      reservedRefs: reservedRefs,
      firstReservedIndex: firstReservedIndex,
      partial: Boolean(chain.partial),
      stoppedReason: String(chain.stoppedReason || ""),
      repairable: !disabledReason && reservedRefs.length > 0,
      disabledReason: disabledReason,
      chainRefs: chain.refs,
    };
  };

  d64.repairReservedTrackFileWithReport = function (
    image,
    entryOrName,
    options,
  ) {
    const bytes =
      image instanceof Uint8Array ? image.slice() : new Uint8Array(image || []);
    const plan = d64.analyzeReservedTrackFileRepair(bytes, entryOrName, options);
    if (!plan.repairable) {
      throw new Error(
        plan.disabledReason || "Reserved-track repair is not available.",
      );
    }
    const firstReservedIndex = Math.max(
      0,
      Math.floor(Number(plan.firstReservedIndex) || 0),
    );
    if (firstReservedIndex === 0) {
      const clearedEntry = new Uint8Array(32);
      return {
        image: d64.writeDirectoryEntryBytes(bytes, plan.entry, clearedEntry),
        repaired: true,
        mode: "cleared-entry",
        entryIndex: plan.entryIndex,
        fileName: plan.fileName,
        partial: plan.partial,
        stoppedReason: plan.stoppedReason,
      };
    }

    const previousRef = plan.chainRefs[firstReservedIndex - 1];
    const previousBlock = d64
      .readSector(bytes, previousRef.track, previousRef.sector)
      .slice();
    previousBlock[0] = 0;
    previousBlock[1] = 255;
    bytes.set(
      previousBlock,
      d64.trackOffset(previousRef.track, previousRef.sector),
    );

    return {
      image: bytes,
      repaired: true,
      mode: "truncated-before-track-18",
      entryIndex: plan.entryIndex,
      fileName: plan.fileName,
      track: previousRef.track,
      sector: previousRef.sector,
      partial: plan.partial,
      stoppedReason: plan.stoppedReason,
    };
  };

  d64.repairReservedTrackFile = function (image, entryOrName, options) {
    return d64.repairReservedTrackFileWithReport(image, entryOrName, options)
      .image;
  };

  d64.analyzeCrossLinkedFileSectorRepair = function (image, options) {
    const config = options || {};
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    const geometry = d64.describeGeometry(bytes);
    const activeEntries = d64.readDirectoryEntries(bytes, config);
    const sectorOwners = {};
    const entryPlans = [];
    const entryPlanByIndex = {};
    const conflictingEntryIndexes = {};
    const conflicts = [];

    activeEntries.forEach(function (entry) {
      const plan = {
        entry: entry,
        entryIndex: entry.index,
        fileName: entry.name,
        fileType: entry.fileType,
        refs: [],
        readError: "",
        partial: false,
        stoppedReason: "",
        repairable: false,
        disabledReason: "",
        requiredSectorCount: 0,
        targetRefs: [],
        sharedRefs: [],
      };
      try {
        const chain = d64.collectRawFileSectorRefsBestEffort(bytes, entry);
        plan.refs = Array.isArray(chain && chain.refs) ? chain.refs.slice() : [];
        plan.partial = Boolean(chain && chain.partial);
        plan.stoppedReason = String((chain && chain.stoppedReason) || "");
      } catch (error) {
        plan.readError = String(error && error.message ? error.message : error);
      }
      entryPlans.push(plan);
      entryPlanByIndex[String(entry.index)] = plan;
      plan.refs.forEach(function (ref) {
        const key = String(ref.track) + ":" + String(ref.sector);
        sectorOwners[key] = sectorOwners[key] || [];
        sectorOwners[key].push(plan);
      });
    });

    Object.keys(sectorOwners).forEach(function (key) {
      const owners = sectorOwners[key];
      if (!owners || owners.length < 2) return;
      const track = Math.max(0, Math.floor(Number(key.split(":")[0]) || 0));
      const sector = Math.max(0, Math.floor(Number(key.split(":")[1]) || 0));
      conflicts.push({
        track: track,
        sector: sector,
        owners: owners.map(function (plan) {
          return {
            entryIndex: plan.entryIndex,
            fileName: plan.fileName,
          };
        }),
      });
      owners.slice(1).forEach(function (plan) {
        conflictingEntryIndexes[String(plan.entryIndex)] = true;
        plan.sharedRefs.push({ track: track, sector: sector });
      });
    });

    const candidates = entryPlans.filter(function (plan) {
      return conflictingEntryIndexes[String(plan.entryIndex)];
    });
    const freeMap = d64.readFreeMap(bytes);
    const availableTargets = [];
    d64.centerOutTrackOrder(geometry.trackCount).forEach(function (track) {
      if (track === DIRECTORY_TRACK) return;
      const sectorCount = d64.trackSectorCount(track);
      for (let sector = 0; sector < sectorCount; sector += 1) {
        if (!freeMap[track] || freeMap[track][sector] !== true) continue;
        availableTargets.push({ track: track, sector: sector });
      }
    });

    const repairableCandidates = [];
    let requiredSectorCount = 0;
    candidates.forEach(function (plan) {
      const reservedRefs = plan.refs.filter(function (ref) {
        return ref.track === DIRECTORY_TRACK;
      });
      if (plan.fileType === "rel") {
        plan.disabledReason =
          "REL files are not yet supported by cross-linked sector repair.";
        return;
      }
      if (plan.readError) {
        plan.disabledReason =
          "This file can not be cloned because its chain can not be read cleanly: " +
          plan.readError;
        return;
      }
      if (!plan.refs.length) {
        plan.disabledReason = "This file has no readable sector chain to copy.";
        return;
      }
      if (reservedRefs.length) {
        plan.disabledReason =
          reservedRefs[0] === plan.refs[0]
            ? "This file starts on reserved track 18 and must be removed rather than cloned."
            : "This file crosses into reserved track 18 and must be truncated or removed rather than cloned.";
        return;
      }
      plan.repairable = true;
      plan.requiredSectorCount = plan.refs.length;
      requiredSectorCount += plan.requiredSectorCount;
      repairableCandidates.push(plan);
    });

    const repairable =
      repairableCandidates.length > 0 &&
      availableTargets.length >= requiredSectorCount;
    const candidateReasonText = candidates
      .map(function (plan) {
        const name = String(plan.fileName || "(unnamed)");
        const reason =
          String(plan.disabledReason || "").trim() ||
          "This conflicting chain could not be prepared for cloning.";
        return '"' + name + '": ' + reason;
      })
      .join(" ");
    const disabledReason =
      repairableCandidates.length === 0
        ? candidates.length
          ? "Cross-linked sectors were found, but none of the later conflicting file chains can be cloned automatically. " +
            candidateReasonText
          : conflicts.length
            ? "Cross-linked sectors were found, but the later conflicting file chain could not be read well enough to clone. Use Remove Entry to mark the later conflicting directory entry as DEL."
            : "Cross-linked sectors were found, but no later conflicting file chain could be isolated for cloning."
        : availableTargets.length < requiredSectorCount
          ? "Not enough free sectors are available to clone the later conflicting file chains (" +
            String(requiredSectorCount) +
            " needed, " +
            String(availableTargets.length) +
            " available). Affected files: " +
            repairableCandidates
              .map(function (plan) {
                return '"' + String(plan.fileName || "(unnamed)") + '"';
              })
              .join(", ") +
            "."
          : "";

    if (repairable) {
      let cursor = 0;
      repairableCandidates.forEach(function (plan) {
        plan.targetRefs = availableTargets.slice(
          cursor,
          cursor + plan.requiredSectorCount,
        );
        cursor += plan.requiredSectorCount;
      });
    }

    return {
      conflicts: conflicts,
      candidates: candidates,
      repairableCandidates: repairableCandidates,
      repairable: repairable,
      disabledReason: disabledReason,
      requiredSectorCount: requiredSectorCount,
      availableSectorCount: availableTargets.length,
    };
  };

  d64.repairCrossLinkedFileSectorsWithReport = function (image, options) {
    const config = options || {};
    const bytes =
      image instanceof Uint8Array ? image.slice() : new Uint8Array(image || []);
    const plan = d64.analyzeCrossLinkedFileSectorRepair(bytes, config);
    if (!plan.repairable) {
      throw new Error(
        plan.disabledReason || "Cross-linked sector repair is not available.",
      );
    }

    let nextImage = bytes.slice();
    const freeMap = d64.readFreeMap(nextImage);
    let movedFilesCount = 0;
    let movedSectorCount = 0;

    plan.repairableCandidates.forEach(function (candidate) {
      const mapping = {};
      candidate.refs.forEach(function (ref, index) {
        mapping[String(ref.track) + ":" + String(ref.sector)] =
          candidate.targetRefs[index];
      });
      candidate.refs.forEach(function (ref, index) {
        const sourceBlock = d64.readSector(bytes, ref.track, ref.sector).slice();
        if (index < candidate.refs.length - 1) {
          const nextRef = candidate.refs[index + 1];
          const nextTarget =
            mapping[String(nextRef.track) + ":" + String(nextRef.sector)] ||
            nextRef;
          sourceBlock[0] = nextTarget.track;
          sourceBlock[1] = nextTarget.sector;
        } else if (candidate.partial) {
          sourceBlock[0] = 0;
          sourceBlock[1] = 255;
        }
        const target = candidate.targetRefs[index];
        nextImage.set(
          sourceBlock,
          d64.trackOffset(target.track, target.sector),
        );
        if (freeMap[target.track] && freeMap[target.track][target.sector] != null) {
          freeMap[target.track][target.sector] = false;
        }
      });
      const entry = d64.readDirectoryEntry(nextImage, candidate.entryIndex);
      const entryBytes = entry.raw.slice();
      entryBytes[3] = candidate.targetRefs[0].track;
      entryBytes[4] = candidate.targetRefs[0].sector;
      nextImage = d64.writeDirectoryEntryBytes(nextImage, entry, entryBytes);
      movedFilesCount += 1;
      movedSectorCount += candidate.targetRefs.length;
    });

    return {
      image: d64.writeBamFreeMap(nextImage, freeMap),
      repaired: movedFilesCount > 0,
      movedFilesCount: movedFilesCount,
      movedSectorCount: movedSectorCount,
      truncatedEntryIndexes: plan.repairableCandidates
        .filter(function (candidate) {
          return candidate.partial;
        })
        .map(function (candidate) {
          return candidate.entryIndex;
        }),
      repairedEntryIndexes: plan.repairableCandidates.map(function (candidate) {
        return candidate.entryIndex;
      }),
    };
  };

  d64.repairCrossLinkedFileSectors = function (image, options) {
    return d64.repairCrossLinkedFileSectorsWithReport(image, options).image;
  };

  d64.repairBamHeaderSectorFileReferenceWithReport = function (
    image,
    entryOrName,
    options,
  ) {
    const config = options || {};
    const bytes =
      image instanceof Uint8Array ? image.slice() : new Uint8Array(image || []);
    const entry =
      typeof entryOrName === "string"
        ? d64.findDirectoryEntryByName(bytes, entryOrName, config)
        : typeof entryOrName === "number"
          ? d64.readDirectoryEntry(bytes, entryOrName)
          : entryOrName || null;
    if (!entry || !entry.typeByte || entry.deleted) {
      throw new Error("Active file not found: " + String(entryOrName || ""));
    }

    const chain = d64.collectRawFileSectorRefsBestEffort(bytes, entry);
    const bamIndex = chain.refs.findIndex(function (ref) {
      return ref.track === DIRECTORY_TRACK && ref.sector === BAM_SECTOR;
    });
    if (bamIndex === -1) {
      return {
        image: bytes,
        repaired: false,
        mode: "not-found",
        entryIndex: entry.index,
        fileName: entry.name,
      };
    }

    if (bamIndex === 0) {
      const clearedEntry = new Uint8Array(32);
      return {
        image: d64.writeDirectoryEntryBytes(bytes, entry, clearedEntry),
        repaired: true,
        mode: "cleared-entry",
        entryIndex: entry.index,
        fileName: entry.name,
      };
    }

    const previousRef = chain.refs[bamIndex - 1];
    const previousBlock = d64
      .readSector(bytes, previousRef.track, previousRef.sector)
      .slice();
    previousBlock[0] = 0;
    previousBlock[1] = 255;
    bytes.set(
      previousBlock,
      d64.trackOffset(previousRef.track, previousRef.sector),
    );
    return {
      image: bytes,
      repaired: true,
      mode: "truncated-before-bam",
      entryIndex: entry.index,
      fileName: entry.name,
      track: previousRef.track,
      sector: previousRef.sector,
    };
  };

  d64.repairBamHeaderSectorFileReference = function (
    image,
    entryOrName,
    options,
  ) {
    return d64.repairBamHeaderSectorFileReferenceWithReport(
      image,
      entryOrName,
      options,
    ).image;
  };

  d64.repairBlockCounts = function (image, entryOrOptions, maybeOptions) {
    const target =
      typeof entryOrOptions === "string" ||
      typeof entryOrOptions === "number" ||
      (entryOrOptions &&
        typeof entryOrOptions === "object" &&
        Object.prototype.hasOwnProperty.call(entryOrOptions, "index"))
        ? entryOrOptions
        : null;
    const config = target ? maybeOptions || {} : entryOrOptions || {};
    let nextImage =
      image instanceof Uint8Array ? image.slice() : new Uint8Array(image || []);
    const entries = d64.readDirectoryEntries(nextImage, config);
    let repairedCount = 0;
    const countReachableFileChainBlocks = function (sourceImage, entry) {
      const geometry = d64.describeGeometry(sourceImage);
      const refs = [];
      const visited = {};
      let track = Math.max(0, Math.floor(Number(entry.startTrack) || 0));
      let sector = Math.max(0, Math.floor(Number(entry.startSector) || 0));
      while (track) {
        if (
          track < 1 ||
          track > geometry.trackCount ||
          sector < 0 ||
          sector >= d64.trackSectorCount(track)
        ) {
          break;
        }
        const key = String(track) + ":" + String(sector);
        if (visited[key]) {
          break;
        }
        visited[key] = true;
        refs.push({ track: track, sector: sector });
        const block = d64.readSector(sourceImage, track, sector);
        if (!block || block.length < SECTOR_SIZE) {
          break;
        }
        const nextTrack = block[0];
        const nextSector = block[1];
        if (!nextTrack) {
          break;
        }
        if (
          nextTrack < 1 ||
          nextTrack > geometry.trackCount ||
          nextSector < 0 ||
          nextSector >= d64.trackSectorCount(nextTrack)
        ) {
          break;
        }
        track = nextTrack;
        sector = nextSector;
      }
      return refs.length;
    };
    entries.forEach(function (entry) {
      if (!entry || entry.deleted || !entry.startTrack) return;
      if (target != null) {
        if (typeof target === "string" && entry.name !== target) return;
        if (
          typeof target === "number" &&
          Number(entry.index) !== Math.floor(Number(target) || 0)
        ) {
          return;
        }
        if (
          target &&
          typeof target === "object" &&
          Number(entry.index) !== Math.floor(Number(target.index) || 0)
        ) {
          return;
        }
      }
      try {
        const expectedCount = countReachableFileChainBlocks(nextImage, entry);
        if (!expectedCount) return;
        const currentCount = Math.max(0, Number(entry.blockCount) || 0);
        if (currentCount === expectedCount) return;
        const entryBytes = entry.raw.slice();
        entryBytes[28] = expectedCount & 0xff;
        entryBytes[29] = (expectedCount >> 8) & 0xff;
        nextImage = d64.writeDirectoryEntryBytes(nextImage, entry, entryBytes);
        repairedCount += 1;
      } catch (error) {
        // Leave unreadable entries untouched.
      }
    });
    return {
      image: nextImage,
      repairedCount: repairedCount,
    };
  };

  d64.diagnoseImage = function (image, options) {
    const bytes =
      image instanceof Uint8Array ? image : new Uint8Array(image || []);
    const config = options || {};
    const knownGeometries = [
      { trackCount: 35, hasErrorInfo: false },
      { trackCount: 35, hasErrorInfo: true },
      { trackCount: 40, hasErrorInfo: false },
      { trackCount: 40, hasErrorInfo: true },
      { trackCount: 42, hasErrorInfo: false },
      { trackCount: 42, hasErrorInfo: true },
    ];
    const exactGeometry =
      knownGeometries.find(function (candidate) {
        return (
          d64.imageSizeForGeometry(
            candidate.trackCount,
            candidate.hasErrorInfo,
          ) === bytes.length
        );
      }) || null;
    const geometry = exactGeometry
      ? d64.describeGeometry(exactGeometry)
      : d64.describeGeometry(bytes);
    const report = {
      actualSize: bytes.length,
      geometry: {
        format: geometry.format,
        trackCount: geometry.trackCount,
        sectorCount: geometry.sectorCount,
        dataSize: geometry.dataSize,
        imageSize: geometry.imageSize,
        hasErrorInfo: geometry.hasErrorInfo,
        exactSizeMatch: Boolean(exactGeometry),
      },
      issues: [],
      summary: {
        informational: 0,
        warning: 0,
        repairable: 0,
        total: 0,
      },
    };

    const addIssue = function (level, code, message, details) {
      const normalizedLevel =
        level === "repairable" || level === "warning" ? level : "informational";
      const issue = {
        level: normalizedLevel,
        code: String(code || "").trim() || "issue",
        message: String(message || "").trim() || "Issue detected.",
      };
      if (details && typeof details === "object") {
        Object.keys(details).forEach(function (key) {
          if (details[key] == null) return;
          issue[key] = details[key];
        });
      }
      report.issues.push(issue);
      report.summary[normalizedLevel] += 1;
      report.summary.total += 1;
      return issue;
    };

    const makeKey = function (track, sector) {
      return String(track) + ":" + String(sector);
    };

    const formatTs = function (track, sector) {
      return "T" + String(track) + " S" + String(sector);
    };

    const formatTsList = function (refs) {
      return (Array.isArray(refs) ? refs : []).map(function (ref) {
        return formatTs(ref.track, ref.sector);
      });
    };

    const listUnique = function (values) {
      const seen = {};
      const result = [];
      (Array.isArray(values) ? values : []).forEach(function (value) {
        const key = String(value);
        if (seen[key]) return;
        seen[key] = true;
        result.push(String(value));
      });
      return result;
    };

    const readSectorSafe = function (track, sector) {
      const safeTrack = Math.max(0, Math.floor(Number(track) || 0));
      const safeSector = Math.max(0, Math.floor(Number(sector) || 0));
      if (
        safeTrack < 1 ||
        safeTrack > geometry.trackCount ||
        safeSector < 0 ||
        safeSector >= d64.trackSectorCount(safeTrack)
      ) {
        return null;
      }
      const offset = d64.trackOffset(safeTrack, safeSector);
      if (offset >= bytes.length) {
        return null;
      }
      return bytes.subarray(
        offset,
        Math.min(offset + SECTOR_SIZE, bytes.length),
      );
    };

    const isValidPointer = function (track, sector, allowZeroTrack) {
      const safeTrack = Math.max(0, Math.floor(Number(track) || 0));
      const safeSector = Math.max(0, Math.floor(Number(sector) || 0));
      if (allowZeroTrack && safeTrack === 0) return true;
      if (safeTrack < 1 || safeTrack > geometry.trackCount) return false;
      return safeSector >= 0 && safeSector < d64.trackSectorCount(safeTrack);
    };

    const validateFieldBytes = function (label, fieldBytes, allowedPattern) {
      const invalid = [];
      const data =
        fieldBytes instanceof Uint8Array
          ? fieldBytes
          : new Uint8Array(fieldBytes || []);
      for (let index = 0; index < data.length; index += 1) {
        const value = data[index];
        if (label === "disk-name") {
          if (d64.isAllowedDiskNameByte(value)) continue;
        } else if (value === 0x00 || value === 0xa0 || value === 0x20) {
          continue;
        } else {
          const ch = String.fromCharCode(value & 0xff);
          if (allowedPattern.test(ch)) continue;
        }
        invalid.push("0x" + value.toString(16).padStart(2, "0").toUpperCase());
      }
      if (invalid.length) {
        addIssue(
          "repairable",
          "invalid-" + label + "-field",
          label + " contains unexpected byte values.",
          {
            items: invalid,
          },
        );
      }
    };

    const walkDirectoryChain = function (startTrack, startSector) {
      const result = {
        sectors: [],
        entries: [],
        visitedKeys: {},
      };
      let track = Math.max(0, Math.floor(Number(startTrack) || 0));
      let sector = Math.max(0, Math.floor(Number(startSector) || 0));
      while (track) {
        if (!isValidPointer(track, sector, false)) {
          addIssue(
            "repairable",
            "invalid-directory-pointer",
            "Directory chain points outside the image geometry.",
            {
              items: [formatTs(track, sector)],
            },
          );
          break;
        }
        if (track !== DIRECTORY_TRACK || sector < DIRECTORY_START_SECTOR) {
          addIssue(
            "repairable",
            "directory-chain-off-track-18",
            "Directory chain leaves the reserved directory track.",
            {
              items: [formatTs(track, sector)],
            },
          );
        }
        const key = makeKey(track, sector);
        if (result.visitedKeys[key]) {
          addIssue(
            "repairable",
            "circular-directory-chain",
            "Directory chain loops back onto itself.",
            {
              items: [formatTs(track, sector)],
            },
          );
          break;
        }
        result.visitedKeys[key] = true;
        const sectorBytes = readSectorSafe(track, sector);
        if (!sectorBytes || sectorBytes.length < SECTOR_SIZE) {
          addIssue(
            "warning",
            "truncated-directory-sector",
            "Directory sector data is missing or truncated.",
            {
              items: [formatTs(track, sector)],
            },
          );
          break;
        }
        result.sectors.push({
          track: track,
          sector: sector,
          nextTrack: sectorBytes[0],
          nextSector: sectorBytes[1],
          raw: new Uint8Array(sectorBytes),
        });
        for (let slot = 0; slot < 8; slot += 1) {
          const offset = slot * 32;
          const entry = d64.parseDirectoryEntryBytes(
            sectorBytes.subarray(offset, offset + 32),
            {
              index: result.entries.length,
              track: track,
              sector: sector,
              slot: slot,
            },
          );
          entry.deleted = d64.isDeletedDirectoryEntry(entry);
          result.entries.push(entry);
        }
        if (!sectorBytes[0]) {
          break;
        }
        track = sectorBytes[0];
        sector = sectorBytes[1];
      }
      return result;
    };

    const walkFileChain = function (entry, labelPrefix) {
      const result = {
        refs: [],
        unusedTailBytes: 0,
        nonZeroSlackBytes: 0,
        terminated: false,
      };
      let track = Math.max(0, Math.floor(Number(entry.startTrack) || 0));
      let sector = Math.max(0, Math.floor(Number(entry.startSector) || 0));
      const visited = {};
      if (!track) {
        addIssue(
          "warning",
          "missing-file-start-pointer",
          labelPrefix + " has no valid starting block.",
          { fileName: entry.name },
        );
        return result;
      }
      while (track) {
      if (!isValidPointer(track, sector, false)) {
        addIssue(
          "repairable",
          "invalid-file-pointer",
            labelPrefix + " points outside the image geometry.",
            {
              fileName: entry.name,
              items: [formatTs(track, sector)],
            },
          );
          break;
        }
        if (track === DIRECTORY_TRACK && sector === BAM_SECTOR) {
          addIssue(
            "repairable",
            "file-uses-bam-header-sector",
            result.refs.length === 0
              ? labelPrefix + " starts in the live BAM/header sector."
              : labelPrefix + " crosses into the live BAM/header sector.",
            {
              fileName: entry.name,
              entryIndex: entry.index,
              details:
                result.refs.length === 0
                  ? "T18 S0 is the live BAM/header sector and can not safely be treated as file data."
                  : "T18 S0 is the live BAM/header sector and the chain must be cut before it.",
              items: [formatTs(track, sector)],
            },
          );
        }
        if (track === DIRECTORY_TRACK && sector !== BAM_SECTOR) {
          addIssue(
            "repairable",
            "file-uses-reserved-track-18",
            labelPrefix + " crosses into the reserved directory track.",
            {
              fileName: entry.name,
              entryIndex: entry.index,
              items: [formatTs(track, sector)],
            },
          );
        }
        const key = makeKey(track, sector);
        if (visited[key]) {
          addIssue(
            "warning",
            "circular-file-chain",
            labelPrefix + " contains a circular sector chain.",
            {
              fileName: entry.name,
              entryIndex: entry.index,
              items: [formatTs(track, sector)],
            },
          );
          break;
        }
        visited[key] = true;
        const block = readSectorSafe(track, sector);
        if (!block || block.length < SECTOR_SIZE) {
          addIssue(
            "warning",
            "truncated-file-sector",
            labelPrefix + " references a missing or truncated sector.",
            {
              fileName: entry.name,
              items: [formatTs(track, sector)],
            },
          );
          break;
        }
        const nextTrack = block[0];
        const nextSector = block[1];
        const usedBytes =
          nextTrack === 0 ? Math.max(0, Math.min(254, nextSector - 1)) : 254;
        const unusedBytes = nextTrack === 0 ? Math.max(0, 254 - usedBytes) : 0;
        let nonZeroSlackBytes = 0;
        if (nextTrack === 0 && unusedBytes) {
          for (let index = 0; index < unusedBytes; index += 1) {
            if (block[2 + usedBytes + index] !== 0) {
              nonZeroSlackBytes += 1;
            }
          }
        }
        result.refs.push({
          track: track,
          sector: sector,
          nextTrack: nextTrack,
          nextSector: nextSector,
        });
        result.unusedTailBytes += unusedBytes;
        result.nonZeroSlackBytes += nonZeroSlackBytes;
        if (!nextTrack) {
          result.terminated = true;
          break;
        }
        if (!isValidPointer(nextTrack, nextSector, false)) {
          addIssue(
            "warning",
            "broken-file-chain",
            labelPrefix + " ends with an invalid next-block pointer.",
            {
              fileName: entry.name,
              entryIndex: entry.index,
              items: [
                formatTs(track, sector) +
                  " -> " +
                  formatTs(nextTrack, nextSector),
              ],
            },
          );
          break;
        }
        track = nextTrack;
        sector = nextSector;
      }
      return result;
    };

    const headerSector = readSectorSafe(DIRECTORY_TRACK, BAM_SECTOR);
    if (!exactGeometry) {
      addIssue(
        "warning",
        "invalid-image-size",
        "Image size does not match a standard 35, 40, or 42 track D64 layout.",
        {
          details:
            "Actual size is " +
            String(bytes.length) +
            " bytes; guessed format is " +
            geometry.format +
            ".",
        },
      );
    }
    if (!headerSector || headerSector.length < SECTOR_SIZE) {
      addIssue(
        "warning",
        "missing-bam-header-sector",
        "Track 18 sector 0 is missing or truncated, so BAM/header diagnosis is incomplete.",
      );
      report.ok = false;
      return report;
    }

    const header = d64.readHeader(bytes);
    report.header = header;
    const bam = d64.readBam(bytes);
    report.bam = {
      trackCount: bam.trackCount,
    };

    const headerAnalysis = d64.analyzeBamLikeSector(headerSector);
    if (!headerAnalysis || !headerAnalysis.looksLikeBam) {
      const hasRecognizableHeader =
        headerAnalysis &&
        (headerAnalysis.hasRecognizedDosVersion ||
          headerAnalysis.hasExpectedDosType ||
          headerAnalysis.hasReadableIdentity);
      addIssue(
        "warning",
        "damaged-bam-or-header",
        hasRecognizableHeader
          ? "Track 18 sector 0 has recognizable header fields, but its BAM free-block table appears damaged or incomplete."
          : "Track 18 sector 0 does not strongly resemble a valid BAM/header sector.",
        headerAnalysis
          ? {
              details: [
                String(headerAnalysis.validTrackEntries || 0) +
                  " of " +
                  String(DEFAULT_TRACK_COUNT) +
                  " BAM track entries are populated and internally consistent.",
                String(headerAnalysis.invalidTrackEntries || 0) +
                  " populated entr" +
                  (Number(headerAnalysis.invalidTrackEntries || 0) === 1
                    ? "y looks invalid."
                    : "ies look invalid."),
                String(headerAnalysis.zeroTrackEntries || 0) +
                  " entr" +
                  (Number(headerAnalysis.zeroTrackEntries || 0) === 1
                    ? "y is 00/00/00/00."
                    : "ies are 00/00/00/00.") +
                  " With a strong header, those can represent fully allocated tracks rather than missing BAM rows.",
              ].join(" "),
            }
          : null,
      );
    }
    if (
      !isValidPointer(
        header.nextDirectoryTrack,
        header.nextDirectorySector,
        true,
      )
    ) {
      addIssue(
        "repairable",
        "invalid-header-directory-pointer",
        "Header points to an invalid starting directory sector.",
        {
          items: [
            formatTs(header.nextDirectoryTrack, header.nextDirectorySector),
          ],
          sectorHighlights: [
            {
              track: DIRECTORY_TRACK,
              sector: BAM_SECTOR,
              byteIndexes: [
                d64.headerOffsets.nextDirectoryTrack,
                d64.headerOffsets.nextDirectorySector,
              ],
            },
          ],
        },
      );
    } else if (
      header.nextDirectoryTrack !== 0 &&
      header.nextDirectoryTrack !== DIRECTORY_TRACK
    ) {
      addIssue(
        "repairable",
        "directory-starts-off-track-18",
        "Header starts the directory chain outside track 18.",
        {
          items: [
            formatTs(header.nextDirectoryTrack, header.nextDirectorySector),
          ],
        },
      );
    }
    if (!d64.isExpected1541DosVersion(header.dosVersionByte)) {
      const dosVersionInfo = d64.describeDosVersion(header.dosVersionByte);
      addIssue(
        "repairable",
        "unknown-dos-version",
        "Header DOS version byte is not the expected 1541 value.",
        {
          details:
            "Byte value is 0x" +
            Number(header.dosVersionByte || 0)
              .toString(16)
              .padStart(2, "0")
              .toUpperCase() +
            (dosVersionInfo && dosVersionInfo.description
              ? " (" + dosVersionInfo.description + ")."
              : "."),
          sectorHighlights: [
            {
              track: DIRECTORY_TRACK,
              sector: BAM_SECTOR,
              byteIndexes: [d64.headerOffsets.dosVersion],
            },
          ],
        },
      );
    }
    if (!d64.isValid1541DosType(header.dosType)) {
      const dosTypeInfo = d64.describeDosType(header.dosType);
      addIssue(
        "repairable",
        "unexpected-dos-type",
        "Header DOS type field is not the expected 1541 DOS type.",
        {
          details:
            'Found "' +
            String(header.dosType || "") +
            '"' +
            (dosTypeInfo && dosTypeInfo.description
              ? " (" + dosTypeInfo.description + ")."
              : "."),
          sectorHighlights: [
            {
              track: DIRECTORY_TRACK,
              sector: BAM_SECTOR,
              byteIndexes: Array.from(
                { length: d64.headerOffsets.dosTypeLength },
                function (_, index) {
                  return d64.headerOffsets.dosTypeStart + index;
                },
              ),
            },
          ],
        },
      );
    }
    if (!String(header.diskName || "").trim()) {
      addIssue("repairable", "blank-disk-name", "Disk name field is blank.");
    }
    if (String(header.diskId || "").trim().length < 2) {
      addIssue(
        "repairable",
        "short-disk-id",
        "Disk ID field is blank or shorter than two characters.",
        {
          sectorHighlights: [
            {
              track: DIRECTORY_TRACK,
              sector: BAM_SECTOR,
              byteIndexes: Array.from(
                { length: d64.headerOffsets.diskIdLength },
                function (_, index) {
                  return d64.headerOffsets.diskIdStart + index;
                },
              ),
            },
          ],
        },
      );
    }

    validateFieldBytes(
      "disk-name",
      headerSector.subarray(
        d64.headerOffsets.diskNameStart,
        d64.headerOffsets.diskNameStart + d64.headerOffsets.diskNameLength,
      ),
      /^[A-Z0-9 !"#$%&'()*+\-./:;<=>?@]$/,
    );
    validateFieldBytes(
      "disk-id",
      headerSector.subarray(
        d64.headerOffsets.diskIdStart,
        d64.headerOffsets.diskIdStart + d64.headerOffsets.diskIdLength,
      ),
      /^[A-Z0-9]$/,
    );
    validateFieldBytes(
      "dos-type",
      headerSector.subarray(
        d64.headerOffsets.dosTypeStart,
        d64.headerOffsets.dosTypeStart + d64.headerOffsets.dosTypeLength,
      ),
      /^[A-Z0-9]$/,
    );

    if (geometry.trackCount > DEFAULT_TRACK_COUNT) {
      addIssue(
        "informational",
        "extended-track-bam-ambiguity",
        "Tracks above 35 have no standard BAM entries in a plain D64, so their free/used state is ambiguous.",
      );
    }

    const errorInfo = d64.readErrorInfo(bytes);
    if (errorInfo.hasErrorInfo) {
      const flagged = [];
      for (let index = 0; index < errorInfo.bytes.length; index += 1) {
        if (errorInfo.bytes[index] !== d64.errorCodes.ok) {
          flagged.push(index);
        }
      }
      addIssue(
        "informational",
        "d64-error-byte-info",
        flagged.length
          ? "D64 error bytes mark sectors with non-OK controller status."
          : "D64 error bytes are present and all sectors currently report OK.",
        flagged.length
          ? {
              details:
                String(flagged.length) +
                " sector error byte" +
                (flagged.length === 1 ? " is" : "s are") +
                " non-OK.",
            }
          : null,
      );
    }

    const unexpectedBamSectors = d64
      .scanForUnexpectedBamSectors(bytes, {
        validateContents: true,
        minConfidence: 4,
      })
      .filter(function (candidate) {
        return Boolean(
          candidate &&
          candidate.validation &&
          candidate.validation.looksConsistent,
        );
      });
    if (unexpectedBamSectors.length) {
      addIssue(
        "warning",
        "unexpected-bam-like-sectors",
        "Additional BAM-like sectors were found elsewhere in the image.",
        {
          items: unexpectedBamSectors.map(function (candidate) {
            return formatTs(candidate.track, candidate.sector);
          }),
        },
      );
    }

    const directory = walkDirectoryChain(
      header.nextDirectoryTrack,
      header.nextDirectorySector,
    );
    const reachableDirectoryKeys = {};
    directory.sectors.forEach(function (sectorInfo) {
      reachableDirectoryKeys[makeKey(sectorInfo.track, sectorInfo.sector)] =
        true;
    });

    const rawDirectoryEntries = [];
    const rawDeletedEntries = [];
    const malformedEntries = [];
    const activeEntries = [];
    for (
      let sectorIndex = DIRECTORY_START_SECTOR;
      sectorIndex < d64.trackSectorCount(DIRECTORY_TRACK);
      sectorIndex += 1
    ) {
      const sectorBytes = readSectorSafe(DIRECTORY_TRACK, sectorIndex);
      if (!sectorBytes || sectorBytes.length < SECTOR_SIZE) {
        continue;
      }
      for (let slot = 0; slot < 8; slot += 1) {
        const offset = slot * 32;
        const entry = d64.parseDirectoryEntryBytes(
          sectorBytes.subarray(offset, offset + 32),
          {
            index: rawDirectoryEntries.length,
            track: DIRECTORY_TRACK,
            sector: sectorIndex,
            slot: slot,
          },
        );
        entry.deleted = d64.isDeletedDirectoryEntry(entry);
        rawDirectoryEntries.push(entry);
        if (!entry.typeByte && !entry.deleted) {
          continue;
        }
        if (entry.deleted) {
          rawDeletedEntries.push(entry);
          continue;
        }
        activeEntries.push(entry);
        if (
          entry.fileType === "unknown" ||
          entry.fileType === "del" ||
          entry.typeCode < 1 ||
          entry.typeCode > 4
        ) {
          malformedEntries.push({
            entryIndex: entry.index,
            track: entry.track,
            sector: entry.sector,
            slot: entry.slot,
            name:
              entry.name ||
              formatTs(entry.track, entry.sector) + " slot " + entry.slot,
            typeByte: entry.typeByte,
            fileType: entry.fileType,
          });
        }
      }
    }

    if (malformedEntries.length) {
      addIssue(
        "repairable",
        "invalid-file-types",
        "Some directory entries use invalid or unsupported file types.",
        {
          items: malformedEntries,
        },
      );
    }

    const duplicateNames = {};
    activeEntries.forEach(function (entry) {
      const normalizedName = String(entry.name || "")
        .trim()
        .toUpperCase();
      if (!normalizedName) return;
      duplicateNames[normalizedName] = duplicateNames[normalizedName] || [];
      duplicateNames[normalizedName].push(entry);
    });
    const duplicateLabels = Object.keys(duplicateNames)
      .filter(function (name) {
        return duplicateNames[name].length > 1;
      })
      .map(function (name) {
        return (
          name +
          " (" +
          duplicateNames[name]
            .map(function (entry) {
              return (
                formatTs(entry.track, entry.sector) + "/" + String(entry.slot)
              );
            })
            .join(", ") +
          ")"
        );
      });
    const duplicateGroups = Object.keys(duplicateNames)
      .filter(function (name) {
        return duplicateNames[name].length > 1;
      })
      .map(function (name) {
        const entries = duplicateNames[name].map(function (entry) {
          return {
            index: entry.index,
            track: entry.track,
            sector: entry.sector,
            slot: entry.slot,
            startTrack: entry.startTrack,
            startSector: entry.startSector,
          };
        });
        const startCounts = {};
        entries.forEach(function (entry) {
          const key =
            String(Number(entry.startTrack) || 0) +
            ":" +
            String(Number(entry.startSector) || 0);
          startCounts[key] = (startCounts[key] || 0) + 1;
        });
        return {
          name: name,
          entries: entries,
          consolidatable: entries.some(function (entry) {
            const key =
              String(Number(entry.startTrack) || 0) +
              ":" +
              String(Number(entry.startSector) || 0);
            return startCounts[key] > 1;
          }),
        };
      });
    const repairableDuplicateGroups = duplicateGroups.filter(function (group) {
      return group && group.consolidatable;
    });
    const warningDuplicateGroups = duplicateGroups.filter(function (group) {
      return !group || !group.consolidatable;
    });
    if (repairableDuplicateGroups.length) {
      addIssue(
        "repairable",
        "duplicate-filenames-repairable",
        "Duplicate active filenames were found in the directory.",
        {
          items: repairableDuplicateGroups.map(function (group) {
            return (
              group.name +
              " (" +
              group.entries
                .map(function (entry) {
                  return (
                    formatTs(entry.track, entry.sector) +
                    "/" +
                    String(entry.slot)
                  );
                })
                .join(", ") +
              ")"
            );
          }),
          duplicateGroups: repairableDuplicateGroups,
        },
      );
    }
    if (warningDuplicateGroups.length) {
      addIssue(
        "warning",
        "duplicate-filenames-warning",
        "Duplicate active filenames were found in the directory.",
        {
          items: warningDuplicateGroups.map(function (group) {
            return (
              group.name +
              " (" +
              group.entries
                .map(function (entry) {
                  return (
                    formatTs(entry.track, entry.sector) +
                    "/" +
                    String(entry.slot)
                  );
                })
                .join(", ") +
              ")"
            );
          }),
          duplicateGroups: warningDuplicateGroups,
        },
      );
    }

    const lockedNames = activeEntries
      .filter(function (entry) {
        return entry.locked;
      })
      .map(function (entry) {
        return entry.name;
      });
    if (lockedNames.length) {
      addIssue(
        "informational",
        "locked-files",
        "Locked files are present in the directory.",
        {
          items: listUnique(lockedNames),
        },
      );
    }

    const splatNames = activeEntries
      .filter(function (entry) {
        return entry.closed === false;
      })
      .map(function (entry) {
        return entry.name;
      });
    if (splatNames.length) {
      addIssue(
        "repairable",
        "splat-files",
        "Unclosed or splat files are present.",
        {
          items: listUnique(splatNames),
        },
      );
    }

    const activeRefs = {};
    const activeRefOwners = {};
    const expectedUsed = {};
    expectedUsed[makeKey(DIRECTORY_TRACK, BAM_SECTOR)] = "bam";
    directory.sectors.forEach(function (sectorInfo) {
      expectedUsed[makeKey(sectorInfo.track, sectorInfo.sector)] = "directory";
    });
    const sharedActiveRefs = [];
    const sharedActiveConflicts = [];
    const slackFiles = [];
    activeEntries.forEach(function (entry) {
      const labelPrefix = 'File "' + String(entry.name || "(unnamed)") + '"';
      if (!String(entry.name || "").trim()) {
        addIssue(
          "warning",
          "malformed-directory-entry",
          labelPrefix + " has a blank filename.",
          {
            fileName: entry.name,
            entryIndex: entry.index,
            track: entry.track,
            sector: entry.sector,
            slot: entry.slot,
            items: [
              formatTs(entry.track, entry.sector) +
                " slot " +
                String(entry.slot),
            ],
            sectorHighlights: [
              {
                track: entry.track,
                sector: entry.sector,
                byteIndexes: Array.from(
                  { length: 16 },
                  function (_, index) {
                    return entry.slot * 32 + 5 + index;
                  },
                ),
              },
            ],
          },
        );
      }
      if (!isValidPointer(entry.startTrack, entry.startSector, false)) {
        addIssue(
          "warning",
          "malformed-directory-entry",
          labelPrefix +
            " has an invalid start pointer " +
            formatTs(entry.startTrack, entry.startSector) +
            ".",
          {
            fileName: entry.name,
            entryIndex: entry.index,
            track: entry.track,
            sector: entry.sector,
            slot: entry.slot,
            items: [
              formatTs(entry.track, entry.sector) +
                " slot " +
                String(entry.slot),
            ],
            sectorHighlights: [
              {
                track: entry.track,
                sector: entry.sector,
                byteIndexes: [entry.slot * 32 + 3, entry.slot * 32 + 4],
              },
            ],
          },
        );
        return;
      }
      if (
        entry.fileType !== "rel" &&
        (entry.sideSectorTrack || entry.sideSectorSector || entry.recordLength)
      ) {
        addIssue(
          "warning",
          "malformed-directory-entry",
          labelPrefix +
            " has REL-only side-sector metadata even though it is " +
            String(entry.fileType || "unknown").toUpperCase() +
            ".",
          {
            fileName: entry.name,
            entryIndex: entry.index,
            items: [
              formatTs(entry.track, entry.sector) +
                " slot " +
                String(entry.slot),
            ],
            sectorHighlights: [
              {
                track: entry.track,
                sector: entry.sector,
                byteIndexes: [
                  entry.slot * 32 + 21,
                  entry.slot * 32 + 22,
                  entry.slot * 32 + 23,
                ],
              },
            ],
          },
        );
      }
      if (entry.fileType === "rel") {
        if (!entry.recordLength || entry.recordLength > REL_MAX_RECORD_LENGTH) {
          addIssue(
            "warning",
            "rel-metadata-problem",
            labelPrefix +
              " has invalid record length " +
              String(entry.recordLength || 0) +
              ".",
            {
              fileName: entry.name,
              entryIndex: entry.index,
              items: [
                formatTs(entry.track, entry.sector) +
                  " slot " +
                  String(entry.slot),
              ],
              sectorHighlights: [
                {
                  track: entry.track,
                  sector: entry.sector,
                  byteIndexes: [entry.slot * 32 + 23],
                },
              ],
            },
          );
        }
        if (
          !isValidPointer(entry.sideSectorTrack, entry.sideSectorSector, false)
        ) {
          addIssue(
            "warning",
            "rel-metadata-problem",
            labelPrefix +
              " has invalid side-sector pointer " +
              formatTs(entry.sideSectorTrack, entry.sideSectorSector) +
              ".",
            {
              fileName: entry.name,
              entryIndex: entry.index,
              items: [
                formatTs(entry.track, entry.sector) +
                  " slot " +
                  String(entry.slot),
              ],
              sectorHighlights: [
                {
                  track: entry.track,
                  sector: entry.sector,
                  byteIndexes: [entry.slot * 32 + 21, entry.slot * 32 + 22],
                },
              ],
            },
          );
        } else {
          try {
            const sideSectors = d64.readRelativeSideSectors(
              bytes,
              entry.sideSectorTrack,
              entry.sideSectorSector,
            );
            sideSectors.forEach(function (sideSector) {
              expectedUsed[makeKey(sideSector.track, sideSector.sector)] =
                "rel-side";
              if (sideSector.recordLength !== entry.recordLength) {
                addIssue(
                  "warning",
                  "rel-metadata-problem",
                  labelPrefix +
                    " has side-sector record length " +
                    String(sideSector.recordLength) +
                    " that does not match entry length " +
                    String(entry.recordLength) +
                    ".",
                  {
                    fileName: entry.name,
                    entryIndex: entry.index,
                    items: [
                      formatTs(sideSector.track, sideSector.sector),
                    ],
                  },
                );
              }
              sideSector.dataSectors.forEach(function (ref) {
                if (!isValidPointer(ref.track, ref.sector, false)) {
                  addIssue(
                    "warning",
                    "rel-metadata-problem",
                    labelPrefix +
                      " references invalid REL data sector " +
                      formatTs(ref.track, ref.sector) +
                      ".",
                    {
                      fileName: entry.name,
                      entryIndex: entry.index,
                      items: [
                        formatTs(sideSector.track, sideSector.sector),
                      ],
                    },
                  );
                }
              });
            });
          } catch (error) {
            addIssue(
              "warning",
              "rel-metadata-problem",
              labelPrefix +
                " has unreadable side sectors: " +
                String(error && error.message ? error.message : error) +
                ".",
              {
                fileName: entry.name,
                entryIndex: entry.index,
                items: [
                  formatTs(entry.sideSectorTrack, entry.sideSectorSector),
                ],
              },
            );
          }
        }
      }
      const fileChain = walkFileChain(entry, labelPrefix);
      if (
        entry.blockCount &&
        fileChain.refs.length &&
        entry.blockCount !== fileChain.refs.length
      ) {
        addIssue(
          "repairable",
          "directory-block-count-mismatch",
          labelPrefix +
            " has a block count that does not match its sector chain.",
          {
            fileName: entry.name,
            entryIndex: entry.index,
            details:
              "Directory says " +
              String(entry.blockCount) +
              ", chain uses " +
              String(fileChain.refs.length) +
              ".",
            items: [
              {
                track: entry.track,
                sector: entry.sector,
                slot: entry.slot,
                entryIndex: entry.index,
              },
            ],
            sectorHighlights: [
              {
                track: entry.track,
                sector: entry.sector,
                byteIndexes: [entry.slot * 32 + 28, entry.slot * 32 + 29],
              },
            ],
          },
        );
      }
      if (fileChain.nonZeroSlackBytes > 0) {
        slackFiles.push(
          labelPrefix +
            " leaves " +
            String(fileChain.nonZeroSlackBytes) +
            " nonzero slack byte" +
            (fileChain.nonZeroSlackBytes === 1 ? "" : "s") +
            ".",
        );
      }
      fileChain.refs.forEach(function (ref) {
        const key = makeKey(ref.track, ref.sector);
        expectedUsed[key] = expectedUsed[key] || "file";
        if (activeRefs[key] && activeRefs[key] !== entry.name) {
          sharedActiveRefs.push(
            formatTs(ref.track, ref.sector) +
              " shared by " +
              activeRefs[key] +
              " and " +
              entry.name,
          );
          const owners = (activeRefOwners[key] || []).slice();
          owners.push({
            entryIndex: entry.index,
            fileName: entry.name,
          });
          sharedActiveConflicts.push({
            track: ref.track,
            sector: ref.sector,
            owners: owners,
          });
        } else {
          activeRefs[key] = entry.name;
          activeRefOwners[key] = [
            {
              entryIndex: entry.index,
              fileName: entry.name,
            },
          ];
        }
      });
    });

    if (sharedActiveRefs.length) {
      addIssue(
        "repairable",
        "cross-linked-file-sectors",
        "Some file sectors are referenced by more than one active file.",
        {
          items: listUnique(sharedActiveRefs),
          conflicts: sharedActiveConflicts,
        },
      );
    }
    if (slackFiles.length) {
      addIssue(
        "informational",
        "nonzero-unused-slack",
        "Unused tail bytes contain nonzero data.",
        {
          items: slackFiles,
        },
      );
    }

    const recoverableDeleted = [];
    const riskyDeleted = [];
    rawDeletedEntries.forEach(function (entry) {
      const label = 'Deleted "' + String(entry.name || "(unnamed)") + '"';
      if (!entry.startTrack) {
        return;
      }
      if (!isValidPointer(entry.startTrack, entry.startSector, false)) {
        riskyDeleted.push(
          label +
            " points to invalid start sector " +
            formatTs(entry.startTrack, entry.startSector) +
            ".",
        );
        return;
      }
      const deletedChain = walkFileChain(entry, label);
      const overlaps = deletedChain.refs
        .filter(function (ref) {
          return Boolean(activeRefs[makeKey(ref.track, ref.sector)]);
        })
        .map(function (ref) {
          return formatTs(ref.track, ref.sector);
        });
      if (overlaps.length) {
        riskyDeleted.push(
          label +
            " overlaps active allocation at " +
            listUnique(overlaps).join(", ") +
            ".",
        );
        return;
      }
      if (deletedChain.refs.length) {
        recoverableDeleted.push(
          {
            name: String(entry.name || "(unnamed)"),
            entryIndex: entry.index,
            track: entry.track,
            sector: entry.sector,
            slot: entry.slot,
            sectors: deletedChain.refs.length,
            message:
              label +
              " may still be recoverable from " +
              String(deletedChain.refs.length) +
              " sector" +
              (deletedChain.refs.length === 1 ? "" : "s") +
              ".",
          },
        );
      }
    });
    if (recoverableDeleted.length) {
      addIssue(
        "informational",
        "recoverable-deleted-entries",
        "Deleted DEL entries with recoverable-looking data were found.",
        {
          items: recoverableDeleted,
        },
      );
    }
    if (riskyDeleted.length) {
      addIssue(
        "warning",
        "unsafe-deleted-entries",
        "Some deleted DEL entries do not look safely recoverable.",
        {
          items: riskyDeleted,
        },
      );
    }

    const bamCountMismatches = [];
    const blocksMarkedFreeButUsed = [];
    const orphanedAllocatedBlocks = [];
    for (
      let track = 1;
      track <= Math.min(DEFAULT_TRACK_COUNT, geometry.trackCount);
      track += 1
    ) {
      const trackInfo = bam.tracks[track - 1];
      if (!trackInfo) continue;
      const computedFreeCount = trackInfo.sectorFree.filter(Boolean).length;
      if (trackInfo.freeCount !== computedFreeCount) {
        bamCountMismatches.push(
          "Track " +
            String(track) +
            ": BAM says " +
            String(trackInfo.freeCount) +
            ", bits show " +
            String(computedFreeCount),
        );
      }
      for (let sector = 0; sector < trackInfo.sectorFree.length; sector += 1) {
        const key = makeKey(track, sector);
        const bamMarksFree = Boolean(trackInfo.sectorFree[sector]);
        const shouldBeUsed = Boolean(expectedUsed[key]);
        if (shouldBeUsed && bamMarksFree) {
          blocksMarkedFreeButUsed.push({ track: track, sector: sector });
        }
        if (!shouldBeUsed && !bamMarksFree) {
          orphanedAllocatedBlocks.push({ track: track, sector: sector });
        }
      }
    }

    if (bamCountMismatches.length) {
      addIssue(
        "repairable",
        "incorrect-bam-free-counts",
        "One or more BAM free-block counts do not match their bitmap entries.",
        {
          items: bamCountMismatches,
        },
      );
    }
    if (blocksMarkedFreeButUsed.length) {
      addIssue(
        "repairable",
        "bam-disagrees-used-blocks-marked-free",
        "BAM marks sectors free even though they are used by the directory or active files.",
        {
          items: formatTsList(blocksMarkedFreeButUsed),
        },
      );
    }
    if (orphanedAllocatedBlocks.length) {
      addIssue(
        "repairable",
        "orphaned-allocated-blocks",
        "BAM marks sectors used even though no reachable active structure claims them.",
        {
          items: formatTsList(orphanedAllocatedBlocks),
        },
      );
    }

    report.ok = report.summary.total === 0;
    report.issues.sort(function (left, right) {
      const weight = {
        repairable: 0,
        warning: 1,
        informational: 2,
      };
      if (weight[left.level] !== weight[right.level]) {
        return weight[left.level] - weight[right.level];
      }
      return String(left.message).localeCompare(String(right.message));
    });
    return report;
  };

  d64.validateImage = function (image, options) {
    const bytes =
      image instanceof Uint8Array ? image.slice() : new Uint8Array(image || []);
    const header = d64.readHeader(bytes);
    const geometry = d64.describeGeometry(bytes);
    const config = options || {};
    const freeMap = {};
    for (let track = 1; track <= geometry.trackCount; track += 1) {
      const sectorCount = d64.trackSectorCount(track);
      freeMap[track] = new Array(sectorCount).fill(true);
    }

    const markUsed = function (refs) {
      (Array.isArray(refs) ? refs : []).forEach(function (ref) {
        const track = Math.max(0, Math.floor(Number(ref.track) || 0));
        const sector = Math.max(0, Math.floor(Number(ref.sector) || 0));
        if (!freeMap[track] || freeMap[track][sector] == null) return;
        freeMap[track][sector] = false;
      });
    };

    const directory = d64.readDirectoryEntriesFrom(
      bytes,
      header.nextDirectoryTrack,
      header.nextDirectorySector,
      Object.assign({}, config, { includeDeleted: true }),
    );

    markUsed([{ track: DIRECTORY_TRACK, sector: BAM_SECTOR }]);
    markUsed(directory.sectors);

    let nextImage = bytes;
    directory.entries.forEach(function (entry) {
      if (!entry || entry.deleted === true) return;
      if (entry.closed === false) {
        const entryBytes = entry.raw.slice();
        entryBytes[2] = 0x00;
        nextImage = d64.writeDirectoryEntryBytes(nextImage, entry, entryBytes);
        return;
      }
      try {
        const refs = d64.collectFileSectorRefs(nextImage, entry, config);
        markUsed(refs);
      } catch (error) {
        // Ignore invalid chains during BAM rebuild; unreachable sectors become free.
      }
    });

    return d64.writeBamFreeMap(nextImage, freeMap, {
      diskName: header.diskName,
      diskId: header.diskId,
      dosType: header.dosType,
      dosVersion: header.dosVersionByte,
      format: header.format,
      trackCount: header.trackCount,
    });
  };

  d64.corruptImageForDoctor = function (image, options) {
    const sourceHeader = image ? d64.readHeader(image) : null;
    const config = options || {};
    let bytes = d64.buildImage(
      [
        {
          name: "LOCKEDA",
          type: "prg",
          locked: true,
          data: new Uint8Array([1, 2, 3, 4]),
        },
        {
          name: "SPLAT",
          type: "prg",
          closed: false,
          data: new Uint8Array([5, 6, 7, 8]),
        },
        {
          name: "RELBAD",
          type: "rel",
          recordLength: 32,
          data: new Uint8Array(64),
        },
        {
          name: "SLACK",
          type: "prg",
          data: new Uint8Array([9, 10, 11, 12]),
        },
      ],
      {
        format: "d64_40_track_error_info",
        diskName:
          (sourceHeader && sourceHeader.diskName) ||
          String(config.diskName || "DOCTOR TRAP"),
        diskId:
          (sourceHeader && sourceHeader.diskId) ||
          String(config.diskId || "DX"),
      },
    );

    const writeSector = function (track, sector, values) {
      const block = new Uint8Array(SECTOR_SIZE);
      block.set(
        values instanceof Uint8Array ? values : new Uint8Array(values || []),
      );
      bytes.set(block, d64.trackOffset(track, sector));
    };

    const readEntry = function (index) {
      return d64.readDirectoryEntry(bytes, index);
    };

    const writeEntry = function (index, entryBytes) {
      bytes = d64.writeDirectoryEntryBytes(bytes, readEntry(index), entryBytes);
    };

    const setBamSectorFlag = function (track, sector, isFree) {
      if (track < 1 || track > DEFAULT_TRACK_COUNT) return;
      if (sector < 0 || sector >= d64.trackSectorCount(track)) return;
      const bamOffset = d64.headerOffsets.bamStart + (track - 1) * 4;
      const byteOffset = bamOffset + 1 + (sector >> 3);
      const mask = 1 << (sector & 7);
      if (isFree) {
        bytes[byteOffset] |= mask;
      } else {
        bytes[byteOffset] &= 0xff ^ mask;
      }
    };

    const setBamTrackRow = function (track, freeCount, bit0, bit1, bit2) {
      if (track < 1 || track > DEFAULT_TRACK_COUNT) return;
      const bamOffset = d64.headerOffsets.bamStart + (track - 1) * 4;
      bytes[bamOffset] = freeCount & 0xff;
      bytes[bamOffset + 1] = bit0 & 0xff;
      bytes[bamOffset + 2] = bit1 & 0xff;
      bytes[bamOffset + 3] = bit2 & 0xff;
    };

    const headerOffset = d64.trackOffset(DIRECTORY_TRACK, BAM_SECTOR);
    bytes[headerOffset + d64.headerOffsets.dosVersion] = 0x99;
    bytes[headerOffset + d64.headerOffsets.diskNameStart + 5] = 0x19;
    bytes[headerOffset + d64.headerOffsets.diskIdStart] = 0x44;
    bytes[headerOffset + d64.headerOffsets.diskIdStart + 1] = 0xa0;
    bytes[headerOffset + d64.headerOffsets.dosTypeStart] = 0x5a;
    bytes[headerOffset + d64.headerOffsets.dosTypeStart + 1] = 0x5a;

    const directorySector1 = d64.readSector(bytes, DIRECTORY_TRACK, 1).slice();
    directorySector1[0] = 0;
    directorySector1[1] = 0;
    bytes.set(directorySector1, d64.trackOffset(DIRECTORY_TRACK, 1));

    let entry0 = d64.createDirectoryEntry("LOCKEDA", "prg", 1, 0, 2, {
      closed: true,
      locked: true,
      sideSectorTrack: 1,
      sideSectorSector: 1,
    });
    writeEntry(0, entry0);
    writeSector(1, 0, [0, 5, 1, 2, 3, 4]);

    let entry1 = d64.createDirectoryEntry("SPLAT", "prg", 1, 1, 1, {
      closed: false,
      locked: false,
    });
    writeEntry(1, entry1);
    writeSector(1, 1, [0, 5, 5, 6, 7, 8]);

    let entry2 = d64.createDirectoryEntry("LOCKEDA", "usr", 1, 2, 1, {
      closed: true,
      locked: false,
    });
    writeEntry(2, entry2);
    writeSector(1, 2, [0, 5, 9, 10, 11, 12]);

    let entry3 = d64.createDirectoryEntry("NOSTART", "prg", 0, 0, 1, {
      closed: true,
    });
    writeEntry(3, entry3);

    let entry4 = d64.createDirectoryEntry("BADPTR", "prg", 99, 99, 1, {
      closed: true,
    });
    writeEntry(4, entry4);

    let entry5 = d64.createDirectoryEntry("RESERVE", "prg", 18, 3, 1, {
      closed: true,
    });
    writeEntry(5, entry5);
    writeSector(18, 3, [0, 5, 82, 69, 83, 86]);

    let entry6 = d64.createDirectoryEntry("LOOP", "prg", 40, 0, 2, {
      closed: true,
    });
    writeEntry(6, entry6);
    writeSector(40, 0, [40, 1, 76, 79, 79, 80]);
    writeSector(40, 1, [40, 0, 66, 65, 67, 75]);

    let entry7 = d64.createDirectoryEntry("BROKEN", "prg", 39, 0, 1, {
      closed: true,
    });
    writeEntry(7, entry7);
    writeSector(39, 0, [99, 99, 66, 82, 75, 78]);

    let entry8 = d64.createDirectoryEntry("RELBAD", "rel", 38, 0, 1, {
      closed: true,
      sideSectorTrack: 99,
      sideSectorSector: 99,
      recordLength: 0,
    });
    writeEntry(8, entry8);
    writeSector(38, 0, [0, 5, 82, 69, 76, 33]);

    let entry9 = d64.createDirectoryEntry("CROSSA", "prg", 1, 0, 1, {
      closed: true,
    });
    writeEntry(9, entry9);

    let entry10 = d64.createDirectoryEntry("SLACK", "prg", 37, 0, 1, {
      closed: true,
    });
    writeEntry(10, entry10);
    const slackSector = new Uint8Array(SECTOR_SIZE);
    slackSector[0] = 0;
    slackSector[1] = 4;
    slackSector[2] = 0x53;
    slackSector[3] = 0x4c;
    slackSector[4] = 0x4b;
    slackSector[5] = 0xaa;
    slackSector[6] = 0xbb;
    slackSector[7] = 0xcc;
    bytes.set(slackSector, d64.trackOffset(37, 0));

    let entry11 = d64.createDirectoryEntry("UNKNOWN", "prg", 36, 0, 1, {
      closed: true,
    });
    entry11[2] = 0x87;
    writeEntry(11, entry11);
    writeSector(36, 0, [0, 5, 85, 78, 75, 33]);

    let entry12 = d64.createDeletedDirectoryEntry("DELSAFE", 35, 0, 1);
    writeEntry(12, entry12);
    writeSector(35, 0, [0, 5, 68, 69, 76, 33]);

    let entry13 = d64.createDeletedDirectoryEntry("DELUNSAFE", 1, 0, 1);
    writeEntry(13, entry13);

    const relinkedDirectorySector2 = d64
      .readSector(bytes, DIRECTORY_TRACK, 2)
      .slice();
    relinkedDirectorySector2[0] = 0;
    relinkedDirectorySector2[1] = 0;
    bytes.set(relinkedDirectorySector2, d64.trackOffset(DIRECTORY_TRACK, 2));

    bytes = d64.writeSectorError(bytes, 1, 0, 0x09, {
      format: "d64_40_track_error_info",
    });

    const copiedBamSector = d64.readSector(bytes, DIRECTORY_TRACK, BAM_SECTOR);
    bytes.set(copiedBamSector, d64.trackOffset(20, 0));

    setBamTrackRow(1, 21, 0xff, 0xff, 0xff);
    setBamTrackRow(18, 17, 0xfc, 0xff, 0x07);
    setBamTrackRow(33, 0, 0x00, 0x00, 0x0a);
    setBamTrackRow(34, 0x80, 0xff, 0x01, 0x11);
    setBamTrackRow(35, 0xff, 0xff, 0x01, 0x53);

    setBamSectorFlag(1, 0, true);
    setBamSectorFlag(1, 1, true);
    setBamSectorFlag(17, 5, false);

    return bytes;
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
      seekDistance === 0 ? 10 : seekDistance === 1 ? 4 : 2 + seekDistance * 2,
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
      const totalDelay = seekDistance * 3 + (rotationalDistance / sectorCount) * 200;
      const rank = [
        totalDelay,
        rotationalDistance,
        seekDistance,
        previousSide && candidateSide !== previousSide ? 1 : 0,
        Math.abs(candidate.track - DIRECTORY_TRACK),
        candidate.sector,
      ];
      if (!best || rank.some((value, index) => value < bestScore[index] && rank.slice(0, index).every((item, prior) => item === bestScore[prior]))) {
        bestScore = rank;
        best = candidate;
      }
    }
    return best;
  };

  d64.findFarthestSlowSector = function (allocation, previousBlock) {
    const freePool = d64.collectAllocatableSectors(allocation);
    if (!freePool.length) return null;
    let best = null;
    let bestScore = -1;
    for (let index = 0; index < freePool.length; index += 1) {
      const candidate = freePool[index];
      const seekDistance = previousBlock
        ? Math.abs(candidate.track - previousBlock.track)
        : Math.abs(candidate.track - DIRECTORY_TRACK);
      const predictedSector = previousBlock
        ? d64.estimateNextSectorWindow(previousBlock, candidate.track)
        : 0;
      const sectorCount = d64.trackSectorCount(candidate.track);
      const rotationalDistance =
        previousBlock == null
          ? (candidate.sector - predictedSector + sectorCount) % sectorCount
          : (candidate.sector - predictedSector + sectorCount) % sectorCount;
      const sideSwitchBonus =
        previousBlock &&
        ((previousBlock.track < DIRECTORY_TRACK &&
          candidate.track > DIRECTORY_TRACK) ||
          (previousBlock.track > DIRECTORY_TRACK &&
            candidate.track < DIRECTORY_TRACK))
          ? 120
          : 0;
      const score =
        seekDistance * 1000 +
        rotationalDistance * 12 +
        Math.abs(candidate.track - DIRECTORY_TRACK) * 4 +
        sideSwitchBonus +
        candidate.sector / 100;
      if (score > bestScore) {
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
    if (count <= 0) return result;
    while (result.length < count) {
      const nextBlock =
        result.length === 0
          ? d64.findFarthestSlowSector(allocation, null)
          : d64.findFarthestSlowSector(allocation, result[result.length - 1]);
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
        dosVersion:
          header.dosVersionByte != null
            ? header.dosVersionByte
            : d64.dosVersions.dos2_6,
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
        dosVersion:
          header.dosVersionByte != null
            ? header.dosVersionByte
            : d64.dosVersions.dos2_6,
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

  d64.averageFileLinkScore = function (image) {
    const scores = [];
    d64.readFiles(image).forEach(function (file) {
      const blocks = Array.isArray(file.blocks) ? file.blocks : [];
      for (let index = 0; index + 1 < blocks.length; index += 1) {
        const previous = blocks[index];
        const next = blocks[index + 1];
        const predicted = d64.estimateNextSectorWindow(previous, next.track);
        const sectorCount = d64.trackSectorCount(next.track);
        const distance = (next.sector - predicted + sectorCount) % sectorCount;
        scores.push(((sectorCount - 1 - distance) / (sectorCount - 1)) * 100);
      }
    });
    return scores.length
      ? scores.reduce(function (sum, score) { return sum + score; }, 0) / scores.length
      : null;
  };

  d64.defragmentImage = function (image, options) {
    const before = d64.averageFileLinkScore(image);
    const nextImage = d64.reflowImage(
      image,
      Object.assign({}, options || {}, {
        allocationMode: "sequential",
      }),
    );
    if (!nextImage || before == null) return nextImage;
    const after = d64.averageFileLinkScore(nextImage);
    return after != null && after + 1e-9 < before ? image.slice() : nextImage;
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
    const targetIndex =
      entryOrName &&
      typeof entryOrName === "object" &&
      entryOrName.index != null
        ? String(entryOrName.index)
        : "";
    const targetName =
      typeof entryOrName === "string"
        ? String(entryOrName).trim().toUpperCase()
        : String((entryOrName && entryOrName.name) || "")
            .trim()
            .toUpperCase();
    const index = files.findIndex(function (file) {
      if (targetIndex) {
        return (
          String(
            file.entry && file.entry.index != null ? file.entry.index : "",
          ) === targetIndex
        );
      }
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
    const currentName = d64.normalizeFileName(files[index].name, 16);
    if (nextName !== currentName) {
      const duplicateIndex = files.findIndex(function (file, fileIndex) {
        if (fileIndex === index) return false;
        return d64.normalizeFileName(file.name, 16) === nextName;
      });
      if (duplicateIndex >= 0) {
        throw new Error("File already exists: " + nextName);
      }
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

  d64.reorderFiles = function (image, orderedNames, options) {
    const files = d64.readFiles(image, options);
    const order = Array.isArray(orderedNames) ? orderedNames.slice() : [];
    const byName = {};
    const byEntryIndex = {};
    files.forEach(function (file) {
      const nameKey = String(file.name || "")
        .trim()
        .toUpperCase();
      const entryIndexKey = String(
        file.entry && file.entry.index != null ? file.entry.index : "",
      );
      if (!byName[nameKey]) {
        byName[nameKey] = [];
      }
      byName[nameKey].push(file);
      byEntryIndex[entryIndexKey] = file;
    });
    const reordered = [];
    const seen = {};
    order.forEach(function (value) {
      const entryIndexKey = String(value || "");
      if (
        entryIndexKey &&
        !seen[entryIndexKey] &&
        byEntryIndex[entryIndexKey]
      ) {
        reordered.push(byEntryIndex[entryIndexKey]);
        seen[entryIndexKey] = true;
        return;
      }
      const nameKey = String(value || "")
        .trim()
        .toUpperCase();
      if (!nameKey || !Array.isArray(byName[nameKey])) return;
      const nextFile = byName[nameKey].find(function (file) {
        const key = String(
          file.entry && file.entry.index != null ? file.entry.index : "",
        );
        return !seen[key];
      });
      if (!nextFile) return;
      reordered.push(nextFile);
      seen[
        String(
          nextFile.entry && nextFile.entry.index != null
            ? nextFile.entry.index
            : "",
        )
      ] = true;
    });
    files.forEach(function (file) {
      const key = String(
        file.entry && file.entry.index != null ? file.entry.index : "",
      );
      if (seen[key]) return;
      reordered.push(file);
      seen[key] = true;
    });
    return d64.composeImageWithDeleted(image, reordered, options);
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
