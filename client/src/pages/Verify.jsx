import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { jsPDF } from "jspdf";
import { getVerifyURL, VerifyQRCode } from "../utils/qrHelper";

function formatDateTime(value) {
  return new Date(value || Date.now()).toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDate(value) {
  return new Date(value || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function drawDetailRow(doc, label, value, x, y, width) {
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(x, y, width, 28, 5, 5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(label.toUpperCase(), x + 10, y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(String(value || "N/A"), x + 10, y + 23, { maxWidth: width - 20 });
}

function normalizeBrandText(value = "") {
  return String(value).replace(/InternTech/g, "Interntex").replace(/interntech/g, "interntex");
}

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [certId, setCertId] = useState(searchParams.get("id") || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [letterLoading, setLetterLoading] = useState(false);

  const verifyCertificate = async (targetId = certId) => {
    if (!targetId) return;
    try {
      setLoading(true);
      const response = await api.get(`/certificates/verify/${targetId}`);
      setResult(response.data);
    } catch (error) {
      setResult(error.response?.data || { valid: false, reason: "not_found" });
    } finally {
      setLoading(false);
    }
  };

  const downloadVerificationLetter = async () => {
    if (!result?.valid) return;
    try {
      setLetterLoading(true);
      const response = await api.get(`/certificates/verification-letter/${result.data.certId}`);
      const { certificate, letterId, issuedAt, statement, organization, signedBy, supportEmail } = response.data;
      const verifyUrl = getVerifyURL(certificate.certId);
      const brandName = normalizeBrandText(organization || "Interntex");
      const letterStatement = normalizeBrandText(statement);
      const signerName = normalizeBrandText(signedBy || "Director, Interntex Learning Programs");
      const supportAddress = normalizeBrandText(supportEmail || "support@interntex.in");
      const doc = new jsPDF();

      doc.setProperties({
        title: `${certificate.certId} Verification Letter`,
        subject: "Interntex certificate verification",
        author: "Interntex",
        creator: "Interntex Verification Portal",
        keywords: `interntex, verification, ${certificate.certId}`
      });

      doc.setFillColor(7, 15, 43);
      doc.rect(0, 0, 210, 42, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(`${brandName} Verification Letter`, 18, 22);
      doc.setFontSize(8);
      doc.setTextColor(191, 219, 254);
      doc.text("Official certificate authenticity confirmation", 18, 31);

      doc.setFillColor(16, 185, 129);
      doc.roundedRect(160, 15, 32, 12, 6, 6, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text("VERIFIED", 176, 23, { align: "center" });

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("To whom it may concern", 18, 58);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(letterStatement, 18, 70, { maxWidth: 174, lineHeightFactor: 1.45 });

      doc.setDrawColor(203, 213, 225);
      doc.line(18, 91, 192, 91);

      drawDetailRow(doc, "Letter ID", letterId, 18, 102, 82);
      drawDetailRow(doc, "Issued At", formatDateTime(issuedAt), 110, 102, 82);
      drawDetailRow(doc, "Certificate ID", certificate.certId, 18, 140, 82);
      drawDetailRow(doc, "Status", "Active and verified", 110, 140, 82);
      drawDetailRow(doc, "Student Name", certificate.studentName, 18, 178, 82);
      drawDetailRow(doc, "Course Name", certificate.courseName, 110, 178, 82);
      drawDetailRow(doc, "Institution", certificate.college || "N/A", 18, 216, 82);
      drawDetailRow(doc, "Completion Date", formatDate(certificate.completionDate), 110, 216, 82);

      doc.setFillColor(239, 246, 255);
      doc.setDrawColor(191, 219, 254);
      doc.roundedRect(18, 254, 174, 18, 5, 5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235);
      doc.text("Verify online:", 25, 265);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 64, 175);
      doc.text(verifyUrl, 58, 265, { maxWidth: 125 });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(signerName, 18, 286);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Support: ${supportAddress}`, 18, 293);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("This letter is system generated from the Interntex verification portal.", 192, 293, { align: "right" });

      doc.save(`${certificate.certId}-verification-letter.pdf`);
    } finally {
      setLetterLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("id")) {
      verifyCertificate(searchParams.get("id"));
    }
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">Certificate Verification</p>
        <h1 className="mt-3 text-4xl font-bold">Verify an Interntex certificate</h1>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input value={certId} onChange={(event) => setCertId(event.target.value)} placeholder="Enter certificate ID" className="flex-1 rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950" />
          <button type="button" onClick={() => verifyCertificate()} className="rounded-2xl bg-blue px-6 py-4 text-sm font-semibold text-white transition hover:bg-navy">
            {loading ? "Verifying..." : "Verify Now"}
          </button>
        </div>

        {result ? (
          <div className={`mt-8 rounded-3xl border p-6 ${result.valid ? "border-success bg-success/10" : "border-danger bg-danger/10"}`}>
            {result.valid ? (
              <>
                <p className="text-lg font-bold text-success">VERIFIED</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                  <p><span className="font-semibold">Student:</span> {result.data.studentName}</p>
                  <p><span className="font-semibold">Course:</span> {result.data.courseName}</p>
                  <p><span className="font-semibold">College:</span> {result.data.college}</p>
                  <p><span className="font-semibold">Certificate ID:</span> {result.data.certId}</p>
                </div>
                <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Authentic and issued by Interntex</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">This certificate record matches the platform verification database.</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
                    <VerifyQRCode certId={result.data.certId} size={80} />
                  </div>
                </div>
                <button type="button" onClick={downloadVerificationLetter} className="mt-6 rounded-2xl bg-blue px-5 py-3 text-sm font-semibold text-white">
                  {letterLoading ? "Preparing Letter..." : "Download Verification Letter PDF"}
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-danger">{result.reason === "revoked" ? "CERTIFICATE REVOKED" : "INVALID CERTIFICATE ID"}</p>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                  {result.reason === "revoked"
                    ? result.revokeReason || "This certificate has been revoked."
                    : "This certificate does not exist in our records."}
                </p>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
