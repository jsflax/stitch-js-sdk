import { GoogleAuthProvider } from "mongodb-stitch-core-sdk";
import StitchRedirectCredential from "../StitchRedirectCredential";

export default class GoogleRedirectCredential
  implements StitchRedirectCredential {
  public constructor(
    public readonly redirectUrl?: string,
    public readonly providerName = GoogleAuthProvider.DEFAULT_NAME,
    public readonly providerType = GoogleAuthProvider.TYPE,
  ) {
  }
}