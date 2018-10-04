---
title: Error Codes Reference
description: "A list of common error codes and how to resolve them."
---

#### To use this list, press Ctrl-F and then type in the error code from yuzu. This should look similar to `XXXX-XXXX` where the Xs represent numbers and letters.

#### Key Errors
##### Please use the general how-to guide, which includes instructions on dumping the necessary files from your switch to have yuzu derive all of your keys,
##### For all: If you try to run recent games and you haven't done the key derivation process recently, you may need to redump and rerun it as newer games use newer keys only available on newer firmwares. Getting an incorrect key means you might have a bad dump of your switch's files. Try again and if it persists, contact the discord. If you are missing the titlekey or an update won't load, sometimes updates change the titlekey between versions -- either way redump and if that doesn't work contact the discord/devs.
| Error Code | Name |
| ---------- | ---- |
| `0008-000C` | `ErrorMissingProductionKeyFile` |
| `0008-000D` | `ErrorMissingHeaderKey` |
| `0008-000E` | `ErrorIncorrectHeaderKey` |
| `0008-0011` | `ErrorMissingTitlekey` |
| `0008-0012` | `ErrorMissingTitlekek` |
| `0008-0014` | `ErrorMissingKeyAreaKey` |
| `0008-0015` | `ErrorIncorrectKeyAreaKey` |
| `0008-0016` | `ErrorIncorrectTitlekeyOrTitlekek` |
| `0008-0018` | `ErrorNCANotProgram` |

#### Other Common Errors
| Error Code | Name |
| ---------- | ---- |
| `0008-001C` | `ErrorNullFile` <br> The file your are trying to use is empty and contains no data. This is a sign of a bad copy or corrupt storage device. |
| `0008-001D` | `ErrorMissingNPDM` <br> Ensure that your rom directory has a file called `main.npdm`. This is used to determine key info about how to run the game and is required to run. You may need to redump if you deleted this. |
| `0008-001E` | `Error32BitISA` <br> The game you are trying to run uses the 32-bit ARM architecture, which is not currently supported by yuzu. |
| `0008-0029` | `ErrorNAXInconvertibleToNCA` <br> The NAX file you are trying to run is not a game but in fact a save file. Double check your files. |
| `0008-002A` | `ErrorBadNAXFilePath` <br> You can only execute games that are NAX encrypted if they are left in the original directory structure from the SD card (`registered/<hex digits>.nca/00`). The hex digits contain needed data to decrypt the game properly. |
| `0008-0039` | `ErrorMissingBKTRBaseRomFS` <br> You are trying to run a game update, which isn't possible. To use a game update, instead go to File > Install file to NAND... and select the update from that menu. After it's done, launch the base game and yuzu will apply the update. |

#### Corruption Errors - All of these errors are indicative of a bad/corrupt dump. If there are no special instructions, try redumping. Should the error persist contact the devs/discord for help.
| Error Code | Name |
| ---------- | ---- |
| `0008-0004` | `ErrorBadNPDMHeader` |
| `0008-0005` | `ErrorBadACIDHeader` |
| `0008-0006` | `ErrorBadACIHeader` |
| `0008-0007` | `ErrorBadFileAccessControl` |
| `0008-0008` | `ErrorBadFileAccessHeader` |
| `0008-0009` | `ErrorBadPFSHeader` |
| `0008-000A` | `ErrorIncorrectPFSFileSize` |
| `0008-0013` | `ErrorInvalidRightsID` |
| `0008-0017` | `ErrorXCIMissingProgramNCA` <br> In some rare cases, this has been known to appear with missing keys. Try rederiving your keys and if that dosen't work contact the devs. |
| `0008-0019` | `ErrorNoExeFS` |
| `0008-001A` | `ErrorBadXCIHeader` |
| `0008-001B` | `ErrorXCIMissingPartition` <br> If you trimmed your XCI, it might have been done improperly. Try avoiding trimming. |
| `0008-001F` | `ErrorNoRomFS` |
| `0008-0020` | `ErrorIncorrectELFFileSize` |
| `0008-0021` | `ErrorLoadingNRO` |
| `0008-0022` | `ErrorNoIcon` |
| `0008-0023` | `ErrorNoControl` |
| `0008-0024` | `ErrorBadNAXHeader` |
| `0008-0025` | `ErrorIncorrectNAXFileSize` |
| `0008-0031` | `ErrorNSPMissingProgramNCA` |
| `0008-0032` | `ErrorBadBKTRHeader` |

#### Less Common General Errors - You should not expect to see these unless you are doing more than just playing games
| Error Code | Name |
| ---------- | ---- |
| `0008-000F` | `ErrorNCA2` <br> The NCA you are attempting to load is using an older format that is not currently supported. If you would like support to be added, consider filing an issue. |
| `0008-0010` | `ErrorNCA0` <br> The NCA you are attempting to load is using an older format that is not currently supported. If you would like support to be added, consider filing an issue. |

#### Less Common Key Errors - Below errors should not be obtained if using the normal key derivation process (which is highly encouraged for newcomers), but if you are not using it these errors will make sense to you.
| Error Code | Name |
| ---------- | ---- |
| `0008-002B` | `ErrorMissingSDSeed`  |
| `0008-002C` | `ErrorMissingSDKEKSource` |
| `0008-002D` | `ErrorMissingAESKEKGenerationSource` |
| `0008-002E` | `ErrorMissingAESKeyGenerationSource` |
| `0008-002F` | `ErrorMissingSDSaveKeySource` |
| `0008-0030` | `ErrorMissingSDNCAKeySource` |

#### Internal Errors - Should never be seen ever. Report to the devs immediately.
| Error Code | Name |
| ---------- | ---- |
| `0008-0000` | `Success` |
| `0008-0001` | `ErrorAlreadyLoaded` |
| `0008-0002` | `ErrorNotImplemented` |
| `0008-0003` | `ErrorNotInitialized` |
| `0008-0026` | `ErrorNAXKeyHMACFailed` |
| `0008-0027` | `ErrorNAXValidationHMACFailed` |
| `0008-0028` | `ErrorNAXKeyDerivationFailed` |
| `0008-0033` | `ErrorBKTRSubsectionNotAfterRelocation` |
| `0008-0034` | `ErrorBKTRSubsectionNotAtEnd` |
| `0008-0035` | `ErrorBadRelocationBlock` |
| `0008-0036` | `ErrorBadSubsectionBlock` |
| `0008-0037` | `ErrorBadRelocationBuckets` |
| `0008-0038` | `ErrorBadSubsectionBuckets` |
