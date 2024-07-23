import { BigNumber } from "ethers";
import { config } from "./config";
import {
  CollectionDataUpdater,
  ERC721Contract,
  ERC721CollectionStatusProvider,
  S3BasicFileDataUpdater,
  S3BasicNftMetadataDataUpdater,
  S3ConfigurationInterface,
} from "@hashlips-lab/collection-data-updater";
import * as readline from "readline";

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
  new ERC721CollectionStatusProvider(contract, BigNumber.from(config.START_TOKEN_ID)),
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
      "USDZAsset",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "/usdz",
      config.PUBLIC_ASSETS_PATH + "/usdz",
      ".usdz",
    ),
    new S3BasicFileDataUpdater(
      "LowPolyGLBAsset",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "extras/lowpoly/glb",
      config.PUBLIC_ASSETS_PATH + "extras/lowpoly/glb",
      ".glb",
    ),
    new S3BasicFileDataUpdater(
      "LowPolyVRMAsset",
      s3Config,
      config.PRIVATE_ASSETS_PATH + "extras/lowpoly/vrm",
      config.PUBLIC_ASSETS_PATH + "extras/lowpoly/vrm",
      ".vrm",
    ),
    new S3BasicNftMetadataDataUpdater(
      "Metadata",
      s3Config,
      config.PRIVATE_METADATA_PATH,
      config.PUBLIC_METADATA_PATH,
      (tokenId: BigNumber, metadata: any) => {
        metadata["image"] = config.PUBLIC_ASSETS_URI_TEMPLATE.replace("{{TOKEN_ID}}", tokenId.toString());
        return metadata;
      },
    ),
  ],
);

collectionDataUpdater.start();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Enter the number of tokens to reveal: ',
});

rl.prompt();

function revealTokensUpTo(tokenNumber: number) {
  for (let i = 1; i <= tokenNumber; i++) {
    collectionDataUpdater.updateToken(BigNumber.from(i));
  }
}

rl.on('line', (input) => {
  const tokenNumber = parseInt(input);
  if (!isNaN(tokenNumber) && tokenNumber > 0) {
    revealTokensUpTo(tokenNumber);
    console.log(`Revealing tokens from 1 to ${tokenNumber}`);
  } else {
    console.log('Invalid number.');
  }
  rl.prompt();
}).on('close', () => {
  console.log('Exiting...');
  process.exit(0);
});