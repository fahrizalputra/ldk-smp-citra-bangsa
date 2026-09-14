import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Penampung data global untuk Ekspor Excel
window.dataRegistrasiList = [];

// ===================================================
// 1. LOGIKA HALAMAN LOGIN (admin-login.html)
// ===================================================
const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "admin-dashboard.html";
    } catch (error) {
      console.error("Error Login:", error);
      alert("Login Gagal! Periksa kembali Email dan Password Anda.\nDetail: " + error.message);
    }
  });
}

// ===================================================
// 2. LOGIKA HALAMAN DASHBOARD (admin-dashboard.html)
// ===================================================

// Logout
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "admin-login.html";
  });
}

// Cek Proteksi Login & Load Data
const stTotal = document.getElementById("stTotal");
if (stTotal) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "admin-login.html";
    } else {
      loadDashboardData();
    }
  });
}

// Ambil Data Firestore
async function loadDashboardData() {
  try {
    const querySnapshot = await getDocs(collection(db, "registrations"));
    window.dataRegistrasiList = [];
    
    querySnapshot.forEach((docSnap) => {
      window.dataRegistrasiList.push({ id: docSnap.id, ...docSnap.data() });
    });

    renderTable(window.dataRegistrasiList);
    updateStats(window.dataRegistrasiList);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
}

// Tampilkan ke Tabel Dashboard
function renderTable(data) {
  const tableBody = document.querySelector("tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  data.forEach((item, index) => {
    const isVerified = item.status === 'Diverifikasi';
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${item.noReg || `LDK2026-${String(index + 1).padStart(4, '0')}`}</strong></td>
      <td>${item.fullName || '-'}</td>
      <td>${item.gender || '-'}</td>
      <td>${item.class || '-'}</td>
      <td>${item.studentWhatsapp || '-'}</td>
      <td>${item.parentName || '-'}</td>
      <td><span class="badge ${isVerified ? 'badge-success' : 'badge-warning'}">${item.status || 'Pending'}</span></td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="toggleVerify('${item.id}', '${item.status || 'Pending'}')">
          ${isVerified ? 'Batal Verify' : 'Verify'}
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteRegistration('${item.id}')">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Fungsi Hapus Data dari Firestore
window.deleteRegistration = async function(id) {
  if (confirm("Apakah Anda yakin ingin menghapus data pendaftaran ini?")) {
    try {
      await deleteDoc(doc(db, "registrations", id));
      alert("Data berhasil dihapus!");
      loadDashboardData();
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Gagal menghapus data: " + error.message);
    }
  }
};

// Fungsi Ubah Status Verifikasi (Toggle)
window.toggleVerify = async function(id, currentStatus) {
  const newStatus = currentStatus === "Diverifikasi" ? "Pending" : "Diverifikasi";
  try {
    await updateDoc(doc(db, "registrations", id), { status: newStatus });
    loadDashboardData();
  } catch (error) {
    console.error("Gagal mengubah status:", error);
    alert("Gagal mengubah status: " + error.message);
  }
};

// Update Angka Statistik Header
function updateStats(data) {
  if (document.getElementById("stTotal")) document.getElementById("stTotal").innerText = data.length;
  if (document.getElementById("st7")) document.getElementById("st7").innerText = data.filter(i => String(i.class).toUpperCase().includes("7") || String(i.class).toUpperCase().includes("VII")).length;
  if (document.getElementById("st8")) document.getElementById("st8").innerText = data.filter(i => String(i.class).toUpperCase().includes("8") || String(i.class).toUpperCase().includes("VIII")).length;
  if (document.getElementById("st9")) document.getElementById("st9").innerText = data.filter(i => String(i.class).toUpperCase().includes("9") || String(i.class).toUpperCase().includes("IX")).length;
  if (document.getElementById("stl")) document.getElementById("stl").innerText = data.filter(i => i.gender === "Laki-laki").length;
  if (document.getElementById("stp")) document.getElementById("stp").innerText = data.filter(i => i.gender === "Perempuan").length;
}

// Tombol Export Excel
const btnExport = document.getElementById("btnExport");
if (btnExport) {
  btnExport.addEventListener("click", () => window.exportToExcel());
}

// Fungsi Ekspor Excel (.xlsx) Lengkap
window.exportToExcel = function() {
  if (!window.dataRegistrasiList || window.dataRegistrasiList.length === 0) {
    alert("Tidak ada data pendaftaran yang bisa diekspor!");
    return;
  }

  const dataForExcel = window.dataRegistrasiList.map((item, index) => {
    const waSiswa = item.studentWhatsapp ? `'${item.studentWhatsapp}` : '';
    const waOrtu = item.parentWhatsapp ? `'${item.parentWhatsapp}` : '';

    return {
      "No": index + 1,
      "No Reg": item.noReg || `LDK2026-${String(index + 1).padStart(4, '0')}`,
      "Nama Lengkap": item.fullName || '',
      "Jenis Kelamin": item.gender || '',
      "Kelas": item.class || '',
      "No. WA Siswa": waSiswa,
      "Tempat Lahir": item.birthPlace || '',
      "Tanggal Lahir": item.birthDate || '',
      "Alamat Lengkap": item.address || '',
      "Nama Ortu/Wali": item.parentName || '',
      "Hubungan": item.parentRelation || '',
      "No. WA Ortu": waOrtu,
      "Alergi": item.allergy || 'Tidak ada',
      "Kondisi Khusus": item.specialCondition || 'Tidak ada',
      "Obat-obatan": item.medicine || 'Tidak ada',
      "Catatan Tambahan": item.notes || '-',
      "Status": item.status || 'Pending'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

  worksheet['!cols'] = [
    { wch: 5 },  { wch: 15 }, { wch: 25 }, { wch: 14 }, { wch: 10 },
    { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 25 },
    { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
    { wch: 25 }, { wch: 15 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pendaftaran LDK");
  XLSX.writeFile(workbook, "Data_Pendaftaran_LDK_SMP_Citra_Bangsa.xlsx");
};