document.addEventListener('DOMContentLoaded', () => {
    // Veri Modelleri
    const processorsData = [
        { id: 'proc-1', name: 'CPU', requiredFile: 'CPU_SYS', currentFile: null },
        { id: 'proc-2', name: 'GPU', requiredFile: 'GPU_SYS', currentFile: null },
        { id: 'proc-3', name: 'NPU', requiredFile: 'NPU_SYS', currentFile: null }
    ];

    const filesData = [
        { id: 'file-1', type: 'CPU_SYS', realName: 'İşlemci Sistem Dosyası (CPU)' },
        { id: 'file-2', type: 'GPU_SYS', realName: 'Grafik Sistem Dosyası (GPU)' },
        { id: 'file-3', type: 'NPU_SYS', realName: 'Yapay Zeka Sistem Dosyası (NPU)' },
        { id: 'file-4', type: 'CORRUPT_1', realName: 'Truva Atı (Virüs)' },
        { id: 'file-5', type: 'CORRUPT_2', realName: 'Bozuk Veri Kümesi' }
    ];

    // DOM Elementleri
    const motherboard = document.getElementById('motherboard');
    const filesContainer = document.getElementById('files-container');
    const selectedProcessorInfo = document.getElementById('selected-processor-info');
    const fixBtn = document.getElementById('fix-btn');
    const runBtn = document.getElementById('run-btn');
    const screenMessage = document.getElementById('screen-message');
    
    const contextMenu = document.getElementById('file-context-menu');
    const contextCheck = document.getElementById('context-check');
    const contextCancel = document.getElementById('context-cancel');

    let selectedProcessorId = null;
    let selectedFileForContext = null;

    // Oyunu Başlat
    initGame();

    function initGame() {
        renderProcessors();
        renderFiles();
        
        // Context menu iptal
        contextCancel.addEventListener('click', () => {
            closeContextMenu();
        });

        // Context menu kontrol et
        contextCheck.addEventListener('click', () => {
            if (selectedFileForContext) {
                const fileObj = filesData.find(f => f.id === selectedFileForContext.id);
                alert(`Dosya Analizi:\nBu dosyanın asıl içeriği: ${fileObj.realName}`);
            }
            closeContextMenu();
        });

        // Dışarı tıklayınca context menu kapansın
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.file-item') && !e.target.closest('.context-menu')) {
                closeContextMenu();
            }
        });

        // Düzelt Butonu
        fixBtn.addEventListener('click', () => {
            if (selectedProcessorId) {
                const procElement = document.getElementById(selectedProcessorId);
                // Önceki tüm fix modları temizle
                document.querySelectorAll('.processor').forEach(p => p.classList.remove('fix-mode'));
                // Seçilene ekle
                procElement.classList.add('fix-mode');
                selectedProcessorInfo.innerText = `${processorsData.find(p => p.id === selectedProcessorId).name} - Bekleniyor... (Dosya Sürükleyin)`;
            }
        });

        // Telefonu Çalıştır
        runBtn.addEventListener('click', () => {
            checkSystem();
        });
    }

    function renderProcessors() {
        motherboard.innerHTML = '';
        processorsData.forEach(proc => {
            const div = document.createElement('div');
            div.className = 'processor broken';
            div.id = proc.id;
            div.innerText = proc.name;

            // İşlemci Seçimi
            div.addEventListener('click', () => {
                document.querySelectorAll('.processor').forEach(p => p.classList.remove('selected'));
                div.classList.add('selected');
                selectedProcessorId = proc.id;
                selectedProcessorInfo.innerText = `Seçilen: ${proc.name} (Bozuk)`;
                fixBtn.disabled = false;
            });

            // Sürükle Bırak Hedefi (Dropzone)
            div.addEventListener('dragover', (e) => {
                e.preventDefault(); // Sürüklemeye izin ver
            });

            div.addEventListener('drop', (e) => {
                e.preventDefault();
                if (div.classList.contains('fix-mode')) {
                    const fileId = e.dataTransfer.getData('text/plain');
                    const fileObj = filesData.find(f => f.id === fileId);
                    if (fileObj) {
                        proc.currentFile = fileObj.type;
                        div.classList.remove('broken', 'fix-mode');
                        div.classList.add('fixed');
                        div.innerText = `${proc.name}\n(Dosya Yüklendi)`;
                        selectedProcessorInfo.innerText = `${proc.name} - Dosya atandı.`;
                        fixBtn.disabled = true;
                    }
                } else {
                    alert("Önce işlemciyi seçip 'Düzelt' tuşuna basmalısınız!");
                }
            });

            motherboard.appendChild(div);
        });
    }

    function renderFiles() {
        filesContainer.innerHTML = '';
        // Dosyaları karıştır
        const shuffledFiles = [...filesData].sort(() => Math.random() - 0.5);

        shuffledFiles.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.id = file.id;
            div.draggable = true;
            
            const icon = document.createElement('div');
            icon.className = 'file-icon';
            
            const text = document.createElement('span');
            text.innerText = `Bilinmeyen Dosya ${index + 1}`; // Gerçek isim gizli

            div.appendChild(icon);
            div.appendChild(text);

            // Sürükle Başlangıcı
            div.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', file.id);
            });

            // Context Menu Açılışı (Tıklama ile)
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedFileForContext = div;
                const rect = div.getBoundingClientRect();
                contextMenu.style.left = `${e.clientX}px`;
                contextMenu.style.top = `${e.clientY}px`;
                contextMenu.classList.remove('hidden');
            });

            filesContainer.appendChild(div);
        });
    }

    function closeContextMenu() {
        contextMenu.classList.add('hidden');
        selectedFileForContext = null;
    }

    function checkSystem() {
        screenMessage.innerHTML = '<span>SİSTEM BAŞLATILIYOR...</span>';
        screenMessage.className = 'screen-content';
        
        setTimeout(() => {
            let hasError = false;
            let errorMsg = "";

            for (const proc of processorsData) {
                if (proc.currentFile === null) {
                    hasError = true;
                    errorMsg = `HATA: ${proc.name} eksik dosya.`;
                    break;
                } else if (proc.currentFile !== proc.requiredFile) {
                    hasError = true;
                    if (proc.currentFile.startsWith('CORRUPT')) {
                        errorMsg = `KRİTİK HATA: ${proc.name} donanımına zararlı yazılım bulaştı!`;
                    } else {
                        errorMsg = `UYUMSUZLUK HATASI: ${proc.name} donanımına yanlış sürücü yüklendi!`;
                    }
                    break;
                }
            }

            if (hasError) {
                screenMessage.innerHTML = `<span>${errorMsg}</span>`;
                screenMessage.classList.add('error');
            } else {
                screenMessage.innerHTML = '<span style="color: #10b981;">SİSTEM BAŞARIYLA BAŞLATILDI.<br>TELEFON KULLANIMA HAZIR.</span>';
                screenMessage.classList.remove('error');
            }
        }, 1500);
    }
});
