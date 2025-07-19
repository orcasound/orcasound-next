import { exec } from "child_process";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    exec("echo hello", (error, stdout, stderr) => {
      if (error) {
        res.status(500).json({
          message: "child_process is not usable",
          error: error.message,
        });
      } else {
        res.status(200).json({
          message: "child_process is working!",
          output: stdout.trim(),
          stderr: stderr.trim(),
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
