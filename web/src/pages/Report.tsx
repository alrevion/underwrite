import type { Run } from "../../../shared/contract";
import { t } from "../i18n";
import { Md } from "../ui/Md";

export function Report({ run }: { run: Run }) {
  const doc = run.report!.fullDocument;
  function download() {
    const url = URL.createObjectURL(new Blob([doc], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `underwrite-${run.concept?.name.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase() || run.id}.md`;
    a.click(); URL.revokeObjectURL(url);
  }
  return (
    <div>
      <div className="row noprint"><button className="btn small" onClick={download}>{t.downloadMd}</button><button className="btn small ghost" onClick={() => window.print()}>{t.print}</button></div>
      <Md src={doc} />
    </div>
  );
}
