#!/usr/bin/env bash
# 发布前在开发机执行：把 server.js / script.js 压成 gzip+base64，供 fix-production-oauth.sh 在 VPS 上一键还原。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
B="$ROOT/scripts/bundles"
mkdir -p "$B"
python3 <<PY
import base64, gzip, pathlib
root = pathlib.Path("$ROOT")
for name in ("server.js", "script.js"):
    raw = (root / name).read_bytes()
    path = pathlib.Path("$B") / f"{name}.gz.b64"
    path.write_text(base64.standard_b64encode(gzip.compress(raw)).decode() + "\n")
    print(path, len(raw), "bytes ->", path.stat().st_size, "chars b64")
PY
