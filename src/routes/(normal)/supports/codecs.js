export function getAllAVCCodecs()
{
	var AVC_PROFILES_DESC = [
		//{ constrained_set0_flag: true },
		//{ constrained_set1_flag: true },
		//{ constrained_set2_flag: true },
		{ profile_idc: 66, description: "Baseline" },
		{ profile_idc: 66, description: "Constrained Baseline", constrained_set1_flag: true},
		{ profile_idc: 77, description: "Main" },
        { profile_idc: 77, description: "Constrained Main", constrained_set1_flag: true},
		{ profile_idc: 88, description: "Extended" },
		{ profile_idc: 100, description: "High", constrained_set4_flag: false },
		{ profile_idc: 100, description: "High Progressive", constrained_set4_flag: true },
		{ profile_idc: 100, description: "Constrained High", constrained_set4_flag: true, constrained_set5_flag: true },
		{ profile_idc: 110, description: "High 10" },
		{ profile_idc: 110, description: "High 10 Intra", constrained_set3_flag: true },
		{ profile_idc: 122, description: "High 4:2:2" },
		{ profile_idc: 122, description: "High 4:2:2 Intra", constrained_set3_flag: true },
		{ profile_idc: 244, description: "High 4:4:4 Predictive" },
		{ profile_idc: 244, description: "High 4:4:4 Intra", constrained_set3_flag: true },
		{ profile_idc: 44, description: "CAVLC 4:4:4 Intra" }
	];

	var AVC_PROFILES_IDC = [ 66, 77, 88, 100, 110, 122, 244, 44];
	var AVC_CONSTRAINTS = [ 0, 4, 8, 16, 32, 64, 128 ];
	var AVC_LEVELS = [ 10, 11, 12, 13, 20, 21, 22, 30, 31, 32, 40, 41, 42, 50, 51, 52];

	var sj, sk, sl;
	var mimes = [];
	for (var j in AVC_PROFILES_IDC) {
		sj = AVC_PROFILES_IDC[j].toString(16);
		if (sj.length == 1) sj = "0"+sj;
		for (var k in AVC_CONSTRAINTS) {
			sk = AVC_CONSTRAINTS[k].toString(16);
			if (sk.length == 1) sk = "0"+sk;

			var desc = "";
			for (let i in AVC_PROFILES_DESC) {
				if (AVC_PROFILES_IDC[j] == AVC_PROFILES_DESC[i].profile_idc) {
					var c = ((AVC_PROFILES_DESC[i].constrained_set0_flag ? 1 : 0) << 7) |
					        ((AVC_PROFILES_DESC[i].constrained_set1_flag ? 1 : 0) << 6) |
					        ((AVC_PROFILES_DESC[i].constrained_set2_flag ? 1 : 0) << 5) |
					        ((AVC_PROFILES_DESC[i].constrained_set3_flag ? 1 : 0) << 4) |
					        ((AVC_PROFILES_DESC[i].constrained_set4_flag ? 1 : 0) << 3) |
					        ((AVC_PROFILES_DESC[i].constrained_set5_flag ? 1 : 0) << 2);
					if (c === AVC_CONSTRAINTS[k]) {
						desc = AVC_PROFILES_DESC[i].description;
						break;
					}
				}
			}
			if (desc.length > 0) {
				for (var l in AVC_LEVELS) {
					sl = AVC_LEVELS[l].toString(16);
					if (sl.length == 1) sl = "0"+sl;
					mimes.push({
						codec: 'avc1.'+sj+sk+sl,
						description: "AVC "+desc+" Level "+ AVC_LEVELS[l]/10
					});
				}
			}
		}
	}
	return mimes;
}

export function getAllAV1Codecs()
{
	var PROFILES_VALUES = [ 0, 1, 2 ];
	var PROFILES_NAMES = [ 'Main', 'High', 'Professional' ];
	var LEVEL_VALUES = [  0,  1,  2,  3,
						  4,  5,  6,  7,
						  8,  9, 10, 11,
						 12, 13, 14, 15,
						 16, 17, 18, 19,
						 20, 21, 22, 23,
						 31];
	var LEVEL_NAMES = [ '2.0', '2.1', '2.2', '2.3',
						'3.0', '3.1', '3.2', '3.3',
						'4.0', '4.1', '4.2', '4.3',
						'5.0', '5.1', '5.2', '5.3',
						'6.0', '6.1', '6.2', '6.3',
						'7.0', '6.1', '7.2', '7.3',
						'Max' ];
	var TIER_VALUES = [ 'M', 'H' ];
	var TIER_NAMES = [ 'Main', 'High' ];
	var DEPTH_VALUES = [ 8, 10, 12];
	var MONOCHROME_VALUES = [ null ];//, 0, 1 ];
	var CHROMA_SUBSAMPLING_VALUES = [ '000', '001', '010', '011', '100', '101', '110', '111' ];
	var COLOR_PRIMARIES_VALUES = [ 0, 1, 2];//, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
	var TRANSER_CHARACTERISTICS_VALUES = [ 0, 1, 2];//, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
	var MATRIX_COEFFICIENT_VALUES = [ 0, 1, 2];//, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
	var VIDEO_FULL_RANGE_FLAG_VALUES = [ 0, 1 ];

	var allValues = [];
	for (var profile in PROFILES_VALUES) {
		for (var level in LEVEL_VALUES) {
			var levelString = ''+LEVEL_VALUES[level];
			if (levelString.length == 1) levelString = "0"+levelString;

			for (var tier in TIER_VALUES) {
				for (var depth in DEPTH_VALUES) {
					var depthString = ''+DEPTH_VALUES[depth];
					if (depthString.length == 1) depthString = "0"+depthString;
					for (var mono in MONOCHROME_VALUES) {
						if (MONOCHROME_VALUES[mono]!= null) {
							for (var chroma in CHROMA_SUBSAMPLING_VALUES) {
								for (var colorPrimary in COLOR_PRIMARIES_VALUES) {
									for (var transfer in TRANSER_CHARACTERISTICS_VALUES) {
										for (var matrix in MATRIX_COEFFICIENT_VALUES) {
											for (var range in VIDEO_FULL_RANGE_FLAG_VALUES) {
												allValues.push({
													codec: 'av01.'+PROFILES_VALUES[profile]+
													'.'+levelString+
													''+TIER_VALUES[tier]+
													'.'+depthString+
													'.'+MONOCHROME_VALUES[mono]+
													'.'+CHROMA_SUBSAMPLING_VALUES[chroma]+
													'.'+COLOR_PRIMARIES_VALUES[colorPrimary]+
													'.'+TRANSER_CHARACTERISTICS_VALUES[transfer]+
													'.'+MATRIX_COEFFICIENT_VALUES[matrix]+
													'.'+VIDEO_FULL_RANGE_FLAG_VALUES[range],
													description: ''
												});
											}
										}
									}
								}
							}
						} else {
							allValues.push({
								codec: 'av01.'+PROFILES_VALUES[profile]+
								'.'+levelString+
								''+TIER_VALUES[tier]+
								'.'+depthString,
								description: 'AV1 '+PROFILES_NAMES[profile]+' Profile, level '+LEVEL_NAMES[level]+', '+TIER_NAMES[tier]+ ' tier, '+DEPTH_VALUES[depth]+' bits'
							});
						}
					}
				}
			}
		}
	}
	return allValues;
}

export function getAllHEVCCodecs() {
    const HEVC_PROFILES_DESC = [
        { profile_idc: 1, description: "Main" },
        { profile_idc: 2, description: "Main 10" },
        { profile_idc: 3, description: "Main Still Picture" },
        { profile_idc: 4, description: "Range Extensions" },
        { profile_idc: 5, description: "High Throughput" },
        { profile_idc: 6, description: "Multiview Main" },
        { profile_idc: 7, description: "Scalable Main" },
        { profile_idc: 8, description: "3D Main" },
        { profile_idc: 9, description: "Screen Content Coding Extensions" },
        { profile_idc: 10, description: "Scalable Format Range Extensions" },
    ];

    const HEVC_TIERS = [
        { tier: 0, tier_name: 'Main' },
        { tier: 1, tier_name: 'High' }
    ];

    const HEVC_LEVELS = [30, 60, 63, 90, 93, 120, 123, 150, 153, 156, 180, 183, 186];
    const HEVC_CONSTRAINTS = ['B0']; // Placeholder for constraints

    const mimes = [];
    for (const profile of HEVC_PROFILES_DESC) {
        for (const tier of HEVC_TIERS) {
            for (const level of HEVC_LEVELS) {
                for (const constraint of HEVC_CONSTRAINTS) {
                    const tierCompatibility = tier.tier === 0 ? 6 : 4; // Example-based
                    const levelHex = level.toString(16).toUpperCase().padStart(2, '0');
                    const codec = `hev1.${profile.profile_idc}.${tierCompatibility}.L${levelHex}.${constraint}`;
                    const levelName = (level / 30).toFixed(1);
                    const description = `HEVC ${profile.description}, ${tier.tier_name} Tier, Level ${levelName}`;
                    mimes.push({ codec, description });
                }
            }
        }
    }
    return mimes;
}

export function getAllVP9Codecs() {
    const VP9_PROFILES = [0, 1, 2, 3];
    const VP9_PROFILE_NAMES = ['Profile 0', 'Profile 1', 'Profile 2', 'Profile 3'];
    const VP9_LEVELS = [10, 11, 20, 21, 30, 31, 40, 41, 50, 51];
    const VP9_LEVEL_NAMES = {
        10: '1.0', 11: '1.1', 20: '2.0', 21: '2.1',
        30: '3.0', 31: '3.1', 40: '4.0', 41: '4.1',
        50: '5.0', 51: '5.1'
    };
    const VP9_BIT_DEPTHS = [8, 10, 12];
    const VP9_CHROMA_SUBSAMPLING = [0, 1, 2];
    const VP9_COLOR_PRIMARIES = [1, 9]; // 1=BT.709, 9=BT.2020
    const VP9_TRANSFER_CHARACTERISTICS = [1, 15]; // 1=BT.709, 15=HLG
    const VP9_MATRIX_COEFFICIENTS = [1, 9]; // 1=BT.709, 9=BT.2020
    const VP9_VIDEO_FULL_RANGE_FLAG = [0, 1];

    const mimes = [];

    const pad = (n) => n.toString().padStart(2, '0');

    const getChromaName = (cs) => {
        switch (cs) {
            case 0: return '4:2:0';
            case 1: return '4:2:2';
            case 2: return '4:4:4';
            default: return 'Unknown';
        }
    };

    const getColorPrimaryName = (cp) => {
        switch (cp) {
            case 1: return 'BT.709';
            case 9: return 'BT.2020';
            default: return 'Unknown';
        }
    };

    const getTransferName = (tc) => {
        switch (tc) {
            case 1: return 'BT.709';
            case 15: return 'HLG';
            default: return 'Unknown';
        }
    };

    const getMatrixName = (mc) => {
        switch (mc) {
            case 1: return 'BT.709';
            case 9: return 'BT.2020';
            default: return 'Unknown';
        }
    };

    for (const profile of VP9_PROFILES) {
        for (const level of VP9_LEVELS) {
            const levelName = VP9_LEVEL_NAMES[level] || 'Unknown';
            for (const bitDepth of VP9_BIT_DEPTHS) {
                // Minimal codec string
                const minimalCodec = `vp09.${pad(profile)}.${pad(level)}.${pad(bitDepth)}`;
                const minimalDesc = `VP9 ${VP9_PROFILE_NAMES[profile]}, Level ${levelName}, ${bitDepth}-bit`;
                mimes.push({ codec: minimalCodec, description: minimalDesc });

                // Full codec strings with all parameters
                for (const chroma of VP9_CHROMA_SUBSAMPLING) {
                    for (const colorPrimary of VP9_COLOR_PRIMARIES) {
                        for (const transfer of VP9_TRANSFER_CHARACTERISTICS) {
                            for (const matrix of VP9_MATRIX_COEFFICIENTS) {
                                for (const range of VP9_VIDEO_FULL_RANGE_FLAG) {
                                    const codec = [
                                        `vp09.${pad(profile)}`,
                                        pad(level),
                                        pad(bitDepth),
                                        pad(chroma),
                                        pad(colorPrimary),
                                        pad(transfer),
                                        pad(matrix),
                                        pad(range)
                                    ].join('.');
                                    const desc = [
                                        minimalDesc,
                                        `Chroma ${getChromaName(chroma)}`,
                                        `Color ${getColorPrimaryName(colorPrimary)}`,
                                        `Transfer ${getTransferName(transfer)}`,
                                        `Matrix ${getMatrixName(matrix)}`,
                                        `${range ? 'Full' : 'Limited'} Range`
                                    ].join(', ');
                                    mimes.push({ codec, description: desc });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return mimes;
}