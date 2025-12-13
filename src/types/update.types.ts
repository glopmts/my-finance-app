export interface UpdateInfo {
  isAvailable: boolean;
  manifest?: any;
  source?: "expo" | "github";
  githubInfo?: GitHubReleaseInfo;
}

export interface UpdateProgress {
  isDownloading: boolean;
  isInstalling: boolean;
  progress: number;
}

export interface GitHubReleaseInfo {
  version: string;
  releaseNotes: string;
  downloadUrl: string;
  isMandatory: boolean;
  publishedAt: string;
  assets: {
    name: string;
    browser_download_url: string;
    size: number;
  }[];
}
