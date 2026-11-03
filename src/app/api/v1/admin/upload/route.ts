import { getSession } from "@/lib/auth";
import { isR2Configured, uploadImage } from "@/lib/r2";


const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);

/** POST /api/v1/admin/upload — multi-file, dikompres WebP lalu disimpan ke R2. */
export async function POST(request: Request): Promise<Response> {
  if (!(await getSession())) {
    return Response.json({ success: false, error: "Tidak terautentikasi." }, { status: 401 });
  }

  if (!isR2Configured()) {
    return Response.json(
      {
        success: false,
        error:
          "Kredensial Cloudflare R2 belum lengkap di .env.local. Upload dinonaktifkan.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ success: false, error: "Form tidak valid." }, { status: 400 });
  }

  const folder = form.get("folder");
  const folderName = typeof folder === "string" && /^[a-z0-9-]+$/.test(folder) ? folder : "accounts";
  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return Response.json({ success: false, error: "Tidak ada berkas." }, { status: 400 });
  }

  const uploaded: Array<{ url: string; bytes: number; width: number; height: number }> = [];

  for (const file of files) {
    if (!ALLOWED.has(file.type)) {
      return Response.json(
        { success: false, error: `Tipe berkas ${file.type || "tidak dikenal"} tidak didukung.` },
        { status: 415 },
      );
    }

    if (file.size > MAX_BYTES) {
      return Response.json(
        { success: false, error: "Ukuran berkas melebihi 8 MB." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const result = await uploadImage(buffer, {
        folder: folderName,
        filenameHint: file.name,
      });

      uploaded.push({
        url: result.url,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      });
    } catch (error) {
      console.error("[admin/upload] gagal upload:", error);
      return Response.json(
        { success: false, error: "Gagal mengunggah gambar ke R2." },
        { status: 502 },
      );
    }
  }

  return Response.json({ success: true, data: uploaded });
}
