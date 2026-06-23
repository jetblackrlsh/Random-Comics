import argparse
import subprocess
import sys
from pathlib import Path


IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}
EXPECTED_PAGES = 18


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Assemble a Monomyth comic PDF from exactly 18 full-page images.",
    )
    parser.add_argument("--pages-dir", required=True, help="Directory containing cover and 17 story page images.")
    parser.add_argument("--out", required=True, help="Output PDF path.")
    parser.add_argument("--preview-dir", default="tmp/monomyth-comic-book-pdf", help="Preview output directory.")
    parser.add_argument("--fit", choices=["blur-fill", "contain", "crop", "stretch"], default="blur-fill")
    args = parser.parse_args()

    pages_dir = Path(args.pages_dir)
    if not pages_dir.exists():
        raise SystemExit(f"Pages directory does not exist: {pages_dir}")

    page_paths = sorted(path for path in pages_dir.iterdir() if path.suffix.lower() in IMAGE_SUFFIXES)
    if len(page_paths) != EXPECTED_PAGES:
        raise SystemExit(f"Monomyth issues require exactly {EXPECTED_PAGES} images; found {len(page_paths)} in {pages_dir}")

    first_page = page_paths[0].name.lower()
    if "cover" not in first_page:
        raise SystemExit(f"First sorted page must be the cover image; found {page_paths[0].name}")

    skills_dir = Path(__file__).resolve().parents[2]
    shared_assembler = skills_dir / "photo-comic-book-pdf" / "scripts" / "assemble_comic_book_pdf.py"
    if not shared_assembler.exists():
        raise SystemExit(f"Shared photo-comic assembler not found: {shared_assembler}")

    subprocess.run(
        [
            sys.executable,
            str(shared_assembler),
            "--pages-dir",
            args.pages_dir,
            "--out",
            args.out,
            "--preview-dir",
            args.preview_dir,
            "--fit",
            args.fit,
            "--max-pages",
            str(EXPECTED_PAGES),
        ],
        check=True,
    )


if __name__ == "__main__":
    main()
