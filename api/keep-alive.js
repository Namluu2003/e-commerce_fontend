// Vercel Cron Job: giữ Render backend không bị sleep (ngủ đông)
// Chạy mỗi 10 phút (cấu hình trong vercel.json) → ping endpoint health của backend.
export default async function handler(_req, res) {
  const backendUrl = process.env.VITE_API_URL;

  // Nếu chưa đặt VITE_API_URL trong Vercel → bỏ qua, không báo lỗi
  if (!backendUrl) {
    return res
      .status(200)
      .json({ ok: false, reason: "VITE_API_URL chưa được đặt" });
  }

  try {
    const r = await fetch(`${backendUrl}/actuator/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.status(200).json({ ok: r.ok, status: r.status });
  } catch (e) {
    // Luôn trả 200 để cron không chạy lại liên tục (tránh tốn quota)
    return res.status(200).json({ ok: false, error: String(e) });
  }
}
