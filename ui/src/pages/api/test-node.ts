export default function handler(req, res) {
  res
    .status(200)
    .json({ message: "Node.js is working!", nodeVersion: process.version });
}
