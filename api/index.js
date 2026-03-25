// Root VIT Student Dashboard API Entry Point
// This handles any /api requests for the dashboard
export default function handler(req, res) {
  res.status(200).json({
    status: "Dashboard API Online",
    message: "Data is currently being managed locally in your browser (LocalStorage) for 1-click Vercel Hosting."
  });
}
