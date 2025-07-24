document.addEventListener("DOMContentLoaded", () => {
  const transactionForm = document.getElementById("transactionForm");
  const transactionTableBody = document.querySelector(
    "#transactionTable tbody"
  );
  const totalPemasukanSpan = document.getElementById("totalPemasukan");
  const totalPengeluaranSpan = document.getElementById("totalPengeluaran");
  const saldoSaatIniSpan = document.getElementById("saldoSaatIni");
  const exportCsvBtn = document.getElementById("exportCsv");
  const clearDataBtn = document.getElementById("clearData");

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  // Fungsi untuk memformat angka menjadi mata uang Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Fungsi untuk menampilkan transaksi ke tabel
  const renderTransactions = () => {
    transactionTableBody.innerHTML = ""; // Kosongkan tabel
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    transactions.forEach((transaction, index) => {
      const row = transactionTableBody.insertRow();

      const dateCell = row.insertCell();
      dateCell.textContent = transaction.date;

      const descCell = row.insertCell();
      descCell.textContent = transaction.description;

      const amountCell = row.insertCell();
      amountCell.textContent = formatRupiah(transaction.amount);
      amountCell.style.color =
        transaction.type === "pemasukan" ? "#2e7d32" : "#c62828"; // Hijau untuk pemasukan, merah untuk pengeluaran

      const typeCell = row.insertCell();
      typeCell.textContent =
        transaction.type === "pemasukan" ? "Pemasukan" : "Pengeluaran";

      const actionCell = row.insertCell();
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Hapus";
      deleteButton.classList.add("delete-btn");
      deleteButton.onclick = () => deleteTransaction(index);
      actionCell.appendChild(deleteButton);

      if (transaction.type === "pemasukan") {
        totalPemasukan += transaction.amount;
      } else {
        totalPengeluaran += transaction.amount;
      }
    });

    const saldoSaatIni = totalPemasukan - totalPengeluaran;
    totalPemasukanSpan.textContent = formatRupiah(totalPemasukan);
    totalPengeluaranSpan.textContent = formatRupiah(totalPengeluaran);
    saldoSaatIniSpan.textContent = formatRupiah(saldoSaatIni);
    saldoSaatIniSpan.style.color = saldoSaatIni >= 0 ? "#1b5e20" : "#c62828"; // Hijau jika positif, merah jika negatif

    localStorage.setItem("transactions", JSON.stringify(transactions)); // Simpan ke Local Storage
  };

  // Fungsi untuk menambah transaksi baru
  transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const description = document.getElementById("deskripsi").value;
    const amount = parseFloat(document.getElementById("jumlah").value);
    const type = document.getElementById("tipe").value;
    const date = new Date().toLocaleDateString("id-ID"); // Tanggal otomatis

    if (description && amount > 0) {
      const newTransaction = {
        date,
        description,
        amount,
        type,
      };
      transactions.push(newTransaction);
      renderTransactions(); // Render ulang tabel
      transactionForm.reset(); // Reset form
    } else {
      alert("Harap isi semua kolom dengan benar. Jumlah harus lebih dari 0.");
    }
  });

  // Fungsi untuk menghapus transaksi
  const deleteTransaction = (index) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      transactions.splice(index, 1); // Hapus 1 item dari array pada index tertentu
      renderTransactions(); // Render ulang tabel
    }
  };

  // Fungsi untuk mengunduh data ke CSV
  exportCsvBtn.addEventListener("click", () => {
    if (transactions.length === 0) {
      alert("Tidak ada data transaksi untuk diunduh.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tanggal,Deskripsi,Jumlah,Tipe\n"; // Header CSV

    transactions.forEach((transaction) => {
      // Ganti koma dengan titik koma jika ada di deskripsi untuk menghindari masalah parsing CSV
      const descriptionSafe = transaction.description.replace(/,/g, ";");
      csvContent += `${transaction.date},"${descriptionSafe}",${transaction.amount},${transaction.type}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_keuangan_bulanan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Fungsi untuk menghapus semua data
  clearDataBtn.addEventListener("click", () => {
    if (
      confirm(
        "Apakah Anda yakin ingin menghapus semua data transaksi? Ini tidak bisa dibatalkan."
      )
    ) {
      transactions = []; // Kosongkan array transaksi
      renderTransactions(); // Render ulang tabel
    }
  });

  // Panggil renderTransactions saat halaman pertama kali dimuat
  renderTransactions();
});
