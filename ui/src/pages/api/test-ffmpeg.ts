import { exec } from "child_process";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    exec("ffmpeg -version", (error, stdout, stderr) => {
      if (error) {
        res.status(500).json({
          message: "FFmpeg is NOT available on this runtime.",
          error: error.message,
          stderr: stderr.trim(),
        });
      } else {
        res.status(200).json({
          message: "FFmpeg is available!",
          version: stdout.split("\n")[0].trim(), // First line usually contains the version
        });
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: "Exception thrown", error: err.message });
    } else {
      res
        .status(500)
        .json({ message: "Unknown exception", error: String(err) });
    }
  }
}
