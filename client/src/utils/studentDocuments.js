import { jsPDF } from "jspdf";
import { getVerifyURL } from "./qrHelper";

function safeFilePart(value = "") {
  return String(value).trim().replace(/[^a-z0-9-]+/gi, "_") || "student";
}

function formatDate(value = Date.now()) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

async function drawRakeshSignature(doc, x, y, width = 64, height = 24) {
  try {
    const signature = await loadImage("/rakesh_sign.png");
    doc.addImage(signature, "PNG", x, y, width, height);
  } catch (_error) {
    doc.setDrawColor(172, 135, 58);
    doc.setLineWidth(0.5);
    doc.line(x + 4, y + 18, x + width - 4, y + 10);
  }
}

function studentNameFrom(input) {
  return input.studentName || input.name || "Student Name";
}

function collegeFrom(input) {
  return input.college || "N/A";
}

export async function generateProfessionalLORPDF(input) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const studentName = studentNameFrom(input);
  const courseName = input.courseName || "Interntex Learning Program";
  const certId = input.certId || input.id || "N/A";
  const issuedDate = formatDate();

  doc.setProperties({
    title: `${studentName} Letter of Recommendation`,
    subject: "Interntex Letter of Recommendation",
    author: "Interntex",
    creator: "Interntex Document Generator"
  });

  doc.setFillColor(7, 15, 43);
  doc.rect(0, 0, 210, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Interntex", 18, 16);
  doc.setFontSize(10);
  doc.setTextColor(191, 219, 254);
  doc.text("Learn. Intern. Succeed.", 18, 24);
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(154, 11, 38, 12, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("OFFICIAL LOR", 173, 19, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Letter of Recommendation", 18, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${issuedDate}`, 18, 62);
  doc.text(`Reference ID: LOR-${certId}`, 18, 69);

  doc.setDrawColor(226, 232, 240);
  doc.line(18, 78, 192, 78);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("To whom it may concern,", 18, 92);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  const paragraphs = [
    `This is to certify that ${studentName} has been associated with Interntex and has successfully participated in the learning program titled "${courseName}".`,
    `${studentName} has demonstrated sincere interest in practical learning, professional growth, and skill development. The learner has shown consistency in engaging with structured course material and career-focused learning activities.`,
    `Based on the available platform record, we recommend ${studentName} for suitable academic, internship, training, and entry-level professional opportunities where dedication, learning ability, and responsible conduct are valued.`,
    `This letter is issued for academic and professional reference. The associated certificate record may be verified through the Interntex verification portal using the certificate/reference ID mentioned above.`
  ];

  let y = 106;
  paragraphs.forEach((paragraph) => {
    const lines = doc.splitTextToSize(paragraph, 174);
    doc.text(lines, 18, y, { lineHeightFactor: 1.45 });
    y += lines.length * 6 + 8;
  });

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(18, 204, 174, 32, 5, 5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("STUDENT", 26, 216);
  doc.text("INSTITUTION", 112, 216);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(studentName, 26, 228, { maxWidth: 74 });
  doc.text(collegeFrom(input), 112, 228, { maxWidth: 70 });

  await drawRakeshSignature(doc, 22, 244, 64, 24);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(18, 270, 92, 270);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Er. Rakesh", 18, 277);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Co-Founder & CEO, Interntex", 18, 283);

  doc.setFontSize(7);
  doc.text("This is a digitally generated recommendation letter issued from the Interntex platform.", 192, 286, { align: "right" });

  return {
    doc,
    fileName: `${safeFilePart(studentName)}-Interntex-LOR.pdf`
  };
}

export async function generateMoocA4CertificatePDF(input) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const studentName = studentNameFrom(input);
  const collegeName = collegeFrom(input);
  const courseName = input.courseName || "MOOC Learning Participation";
  const duration = input.duration || "08 weeks";
  const rawCertId = String(input.certId || input.id || Date.now());
  const certId = rawCertId.startsWith("MOOC-") ? rawCertId : `MOOC-${rawCertId}`;
  const completionDate = input.completionDate || Date.now();
  const issuedDate = formatDate(completionDate);
  const endDate = new Date(completionDate);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 56);
  const score = input.score || input.percentage || "95";
  const assignmentScore = input.assignmentScore || "24/25";
  const examScore = input.examScore || "72/75";
  const verifyUrl = getVerifyURL(certId);

  doc.setProperties({
    title: `${studentName} MOOC Certificate`,
    subject: "Interntex MOOC Certificate",
    author: "Interntex",
    creator: "Interntex Document Generator"
  });

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, "F");

  doc.setDrawColor(31, 68, 112);
  doc.setLineWidth(2.2);
  doc.rect(8, 8, 194, 281);

  doc.setDrawColor(31, 68, 112);
  doc.setLineWidth(0.55);
  doc.rect(11, 11, 188, 275);

  doc.setDrawColor(172, 135, 58);
  doc.setLineWidth(0.5);
  doc.rect(15, 15, 180, 267);

  doc.setFillColor(31, 68, 112);
  doc.rect(8, 8, 18, 2.2, "F");
  doc.rect(8, 8, 2.2, 18, "F");
  doc.rect(184, 8, 18, 2.2, "F");
  doc.rect(199.8, 8, 2.2, 18, "F");
  doc.rect(8, 286.8, 18, 2.2, "F");
  doc.rect(8, 271, 2.2, 18, "F");
  doc.rect(184, 286.8, 18, 2.2, "F");
  doc.rect(199.8, 271, 2.2, 18, "F");

  doc.setDrawColor(172, 135, 58);
  doc.setLineWidth(0.65);
  doc.line(18, 21, 42, 21);
  doc.line(21, 18, 21, 42);
  doc.line(168, 21, 192, 21);
  doc.line(189, 18, 189, 42);
  doc.line(18, 276, 36, 276);
  doc.line(21, 262, 21, 279);
  doc.line(174, 276, 192, 276);
  doc.line(189, 262, 189, 279);

  doc.setLineWidth(0.25);
  doc.line(18, 65, 18, 222);
  doc.line(192, 65, 192, 222);

  try {
    const logo = await loadImage("/interntex-logo.png");
    doc.addImage(logo, "PNG", 86, 30, 38, 20);
  } catch (_error) {
    doc.setTextColor(31, 68, 112);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("interntex", 105, 42, { align: "center" });
  }

  try {
    const qr = await loadImage(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verifyUrl)}&margin=1`);
    doc.addImage(qr, "PNG", 158, 24, 30, 30);
  } catch (_error) {
    doc.setDrawColor(31, 68, 112);
    doc.rect(158, 24, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("VERIFY", 173, 41, { align: "center" });
  }

  doc.setTextColor(31, 68, 112);
  doc.setFont("times", "normal");
  doc.setFontSize(24);
  doc.text("CERTIFICATE OF COMPLETION", 105, 72, { align: "center" });

  const drawCenteredLines = (text, y, options = {}) => {
    const {
      color = [0, 0, 0],
      font = "times",
      style = "italic",
      size = 15,
      maxWidth = 170,
      lineGap = 7
    } = options;
    doc.setTextColor(...color);
    doc.setFont(font, style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line, index) => {
      doc.text(line, 105, y + index * lineGap, { align: "center" });
    });
    return y + Math.max(lines.length, 1) * lineGap;
  };

  let y = 90;
  y = drawCenteredLines("This Certificate is awarded to", y, { size: 15, lineGap: 8 }) + 5;
  y = drawCenteredLines(studentName.toUpperCase(), y, {
    color: [31, 68, 112],
    style: "bolditalic",
    size: studentName.length > 28 ? 16 : 18,
    maxWidth: 172,
    lineGap: 8
  }) + 3;
  y = drawCenteredLines("Of", y, { size: 15, lineGap: 8 }) + 4;
  y = drawCenteredLines(collegeName.toUpperCase(), y, {
    color: [31, 68, 112],
    style: "bolditalic",
    size: collegeName.length > 34 ? 15 : 17,
    maxWidth: 166,
    lineGap: 8
  }) + 5;
  y = drawCenteredLines(`for successfully completing ${duration} MOOC Training on`, y, {
    size: 15,
    maxWidth: 176,
    lineGap: 8
  }) + 4;
  y = drawCenteredLines(courseName.toUpperCase(), y, {
    color: [31, 68, 112],
    style: "bolditalic",
    size: courseName.length > 38 ? 14 : 16,
    maxWidth: 170,
    lineGap: 8
  }) + 7;

  doc.setTextColor(0, 0, 0);
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.text(`From ${formatDate(startDate)} to ${formatDate(endDate)}`, 105, y, { align: "center" });
  y += 14;
  doc.text("with a consolidated score of", 93, y, { align: "right" });
  doc.setFont("times", "bolditalic");
  doc.text(String(score), 112, y, { align: "center" });
  doc.setFont("times", "italic");
  doc.text("%", 128, y, { align: "center" });
  y += 9;

  const tableY = Math.min(y, 216);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.rect(40, tableY, 130, 7);
  doc.line(80, tableY, 80, tableY + 7);
  doc.line(96, tableY, 96, tableY + 7);
  doc.line(142, tableY, 142, tableY + 7);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("Online Assignments", 60, tableY + 5, { align: "center" });
  doc.text(assignmentScore, 88, tableY + 5, { align: "center" });
  doc.text("Proctored Exam", 119, tableY + 5, { align: "center" });
  doc.text(examScore, 156, tableY + 5, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(12);
  const totalY = Math.min(tableY + 25, 220);
  doc.text("Total number of candidates certified in this course : 620", 105, totalY, { align: "center" });

  try {
    const aicteLogo = await loadImage("/aicte.png");
    doc.addImage(aicteLogo, "PNG", 88, 226, 14, 14);
  } catch (_error) {
    doc.setDrawColor(31, 68, 112);
    doc.circle(95, 233, 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.text("AICTE", 95, 235, { align: "center" });
  }

  try {
    const ugcLogo = await loadImage("/ugc.png");
    doc.addImage(ugcLogo, "PNG", 108, 226, 14, 14);
  } catch (_error) {
    doc.setDrawColor(31, 68, 112);
    doc.circle(115, 233, 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.text("UGC", 115, 235, { align: "center" });
  }

  await drawRakeshSignature(doc, 82, 240, 46, 16);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Er. Rakesh", 105, 258, { align: "center" });
  doc.setFontSize(9);
  doc.text("Co-Founder & CEO, Interntex", 105, 265, { align: "center" });

  doc.setFontSize(6.5);
  doc.text(`Date of Certification : ${issuedDate}`, 24, 278);
  doc.text(`Certificate no : ${certId}`, 186, 278, { align: "right" });
  doc.setFontSize(5.5);
  doc.text(`For certificate authenticity, please visit ${verifyUrl}`, 105, 282, { align: "center", maxWidth: 168 });

  return {
    doc,
    fileName: `${safeFilePart(studentName)}-Moocs-Certificate.pdf`
  };
}
