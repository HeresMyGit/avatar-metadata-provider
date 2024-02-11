import { BigNumber } from "ethers";
import { config } from "./config";
import {
  CollectionDataUpdater,
  ERC721Contract,
  ERC721CollectionStatusProvider,
  S3BasicFileDataUpdater,
  S3BasicNftMetadataDataUpdater,
  S3ConfigurationInterface,
  UpdateAllTokensEveryNSecondsRuntime,
  UpdateTokenOnMintRuntime,
} from "@hashlips-lab/collection-data-updater";

const contract = new ERC721Contract(
  config.CONTRACT_ADDRESS,
  config.RPC_ENDPOINT,
);

const s3Config = {
  accessKey: config.S3_ACCESS_KEY,
  secretKey: config.S3_SECRET_KEY,
  endpoint: config.S3_ENDPOINT_URL,
  bucketName: config.S3_BUCKET_NAME,
  pathPrefix: config.S3_PATH_PREFIX,
} as S3ConfigurationInterface;

const collectionDataUpdater = new CollectionDataUpdater(
  /*
   * This object tells which tokens can be revealed and which ones cannot.
   */
  new ERC721CollectionStatusProvider(contract, BigNumber.from(config.START_TOKEN_ID)),
  /*
   * The DataUpdaters are objects which perform operations whenever a token has to
   * be revealed or hidden.
   * The S3BasicFileDataUpdater is the simplest one: it copies a single file from
   * a private folder to a public one.
   */
  [
    new S3BasicFileDataUpdater(
      "Asset",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/png",
      config.PUBLIC_ASSETS_PATH + "/png",
      config.ASSETS_EXTENSION,
    ),
    new S3BasicFileDataUpdater(
      "GLBAsset",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/glb",
      config.PUBLIC_ASSETS_PATH + "/glb",
      ".glb",
    ),
    new S3BasicFileDataUpdater(
      "VRMAsset",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/vrm",
      config.PUBLIC_ASSETS_PATH + "/vrm",
      ".vrm",
    ),
    new S3BasicFileDataUpdater(
      "FBXAsset",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/fbx",
      config.PUBLIC_ASSETS_PATH + "/fbx",
      ".fbx",
    ),
    new S3BasicFileDataUpdater(
      "USDZAsset",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/usdz",
      config.PUBLIC_ASSETS_PATH + "/usdz",
      ".usdz",
    ),
    new S3BasicFileDataUpdater(
      "GLBChristmas",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/extras/christmas/glb",
      config.PUBLIC_ASSETS_PATH + "/extras/christmas/glb",
      ".glb",
    ),
    new S3BasicFileDataUpdater(
      "VRMChristmas",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/extras/christmas/vrm",
      config.PUBLIC_ASSETS_PATH + "/extras/christmas/vrm",
      ".vrm",
    ),
    new S3BasicFileDataUpdater(
      "FBXChristmas",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/extras/christmas/fbx",
      config.PUBLIC_ASSETS_PATH + "/extras/christmas/fbx",
      ".fbx",
    ),
    new S3BasicFileDataUpdater(
      "USDZChristmas",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/extras/christmas/usdz",
      config.PUBLIC_ASSETS_PATH + "/extras/christmas/usdz",
      ".usdz",
    ),
    new S3BasicFileDataUpdater(
      "GLBWinter",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/extras/winter/glb",
      config.PUBLIC_ASSETS_PATH + "/extras/winter/glb",
      ".glb",
    ),
    new S3BasicFileDataUpdater(
      "VRMWinter",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/extras/winter/vrm",
      config.PUBLIC_ASSETS_PATH + "/extras/winter/vrm",
      ".vrm",
    ),
    new S3BasicFileDataUpdater(
      "FBXWinter",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/extras/winter/fbx",
      config.PUBLIC_ASSETS_PATH + "/extras/winter/fbx",
      ".fbx",
    ),
    new S3BasicFileDataUpdater(
      "USDZWinter",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/extras/winter/usdz",
      config.PUBLIC_ASSETS_PATH + "/extras/winter/usdz",
      ".usdz",
    ),
    new S3BasicFileDataUpdater(
      "FBXDrone",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/extras/drone/fbx",
      config.PUBLIC_ASSETS_PATH + "/extras/drone/fbx",
      ".fbx",
    ),
    new S3BasicNftMetadataDataUpdater(
      "Metadata",
      s3Config,
      config.PRIVATE_METADATA_PATH,
      config.PUBLIC_METADATA_PATH,
      (tokenId: BigNumber, metadata: any) => {
        // Update any metadata value here...
        metadata["image"] = config.PUBLIC_ASSETS_URI_TEMPLATE.replace("{{TOKEN_ID}}", tokenId.toString());

        return metadata;
      },
    ),
  ],
  /*
   * Runtimes are the objects which trigger updates on the data.
   * The CollectionDataUpdater offers methods to update a single token or the
   * whole collection, runtimes can call these methods in response to external
   * events or timers.
   */
  [
    // new UpdateAllTokensEveryNSecondsRuntime(parseInt(config.FULL_REFRESH_DELAY)),
    new UpdateTokenOnMintRuntime(contract),
  ],
);

collectionDataUpdater.start();
