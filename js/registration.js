import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Helper aman untuk mengambil value input tanpa error jika ID tidak ada di HTML
const getValue = (id) => document.getElementById(id)?.value || "";

window.nextStep = function(currentStep) {
  if (currentStep === 1) {
    if (!getValue("fullName")) return alert("Nama lengkap wajib diisi.");
    if (!getValue("class")) return alert("Silakan pilih kelas.");
    if (!getValue("studentWhatsapp")) return alert("Nomor WhatsApp wajib diisi.");
  }
  if (currentStep === 2) {
    if (!getValue("parentName")) return alert("Nama Orang Tua wajib diisi.");
    if (!getValue("parentWhatsapp")) return alert("WhatsApp Orang Tua wajib diisi.");
  }
  if (currentStep === 3) {
    buildSummary();
  }

  document.getElementById(`step-${currentStep}`)?.classList.remove("active");
  document.getElementById(`step-indicator-${currentStep}`)?.classList.remove("active");

  document.getElementById(`step-${currentStep + 1}`)?.classList.add("active");
  document.getElementById(`step-indicator-${currentStep + 1}`)?.classList.add("active");
};

window.prevStep = function(currentStep) {
  document.getElementById(`step-${currentStep}`)?.classList.remove("active");
  document.getElementById(`step-indicator-${currentStep}`)?.classList.remove("active");

  document.getElementById(`step-${currentStep - 1}`)?.classList.add("active");
  document.getElementById(`step-indicator-${currentStep - 1}`)?.classList.add("active");
};

window.toggleDetail = function(selectId, boxId) {
  const val = getValue(selectId);
  const box = document.getElementById(boxId);
  if (box) box.style.display = val === "Ada" ? "block" : "none";
};

function buildSummary() {
  const genderEl = document.querySelector('input[name="gender"]:checked');
  const gender = genderEl ? genderEl.value : "-";

  const html = `
    <h4>DATA PESERTA</h4>
    <p><strong>Nama:</strong> ${getValue("fullName")}</p>
    <p><strong>Jenis Kelamin:</strong> ${gender}</p>
    <p><strong>Kelas:</strong> ${getValue("class")}</p>
    <p><strong>WA Siswa:</strong> ${getValue("studentWhatsapp")}</p>
    <h4>DATA ORANG TUA / WALI</h4>
    <p><strong>Nama Ortu:</strong> ${getValue("parentName")} (${getValue("parentRelation")})</p>
    <p><strong>WA Ortu:</strong> ${getValue("parentWhatsapp")}</p>
    <h4>DATA TAMBAHAN</h4>
    <p><strong>Alergi:</strong> ${getValue("allergy")} ${getValue("allergyDetail")}</p>
  `;
  const summaryContainer = document.getElementById("summaryContainer");
  if (summaryContainer) summaryContainer.innerHTML = html;
}

const chk1 = document.getElementById("chk1");
const chk2 = document.getElementById("chk2");
const btnSubmit = document.getElementById("btnSubmit");

if(chk1 && chk2) {
  const validateCheck = () => { if(btnSubmit) btnSubmit.disabled = !(chk1.checked && chk2.checked); };
  chk1.addEventListener("change", validateCheck);
  chk2.addEventListener("change", validateCheck);
}

const regForm = document.getElementById("regForm");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const snapshot = await getDocs(collection(db, "registrations"));
      const count = snapshot.size + 1;
      const regNo = `LDK2026-${String(count).padStart(4, "0")}`;

      const genderEl = document.querySelector('input[name="gender"]:checked');

      const payload = {
        registrationNumber: regNo,
        fullName: getValue("fullName"),
        gender: genderEl ? genderEl.value : "-",
        class: getValue("class"),
        studentWhatsapp: getValue("studentWhatsapp"),
        birthPlace: getValue("birthPlace"),
        birthDate: getValue("birthDate"),
        address: getValue("address"),
        parentName: getValue("parentName"),
        parentRelation: getValue("parentRelation"),
        parentWhatsapp: getValue("parentWhatsapp"),
        parentApproval: getValue("parentJob"),
        allergy: getValue("allergy"),
        allergyDetail: getValue("allergyDetail"),
        specialCondition: getValue("specialCondition"),
        conditionDetail: getValue("conditionDetail"),
        medicine: getValue("medicine"),
        medicineDetail: getValue("medicineDetail"),
        notes: getValue("notes"),
        registrationDate: new Date().toISOString(),
        status: "Terdaftar"
      };

      await addDoc(collection(db, "registrations"), payload);
      sessionStorage.setItem("ldkRegSuccess", JSON.stringify(payload));
      window.location.href = "success.html";
    } catch (err) {
      alert("Gagal Pendaftaran: " + err.message);
    }
  });
}