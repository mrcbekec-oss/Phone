document.addEventListener('DOMContentLoaded', () => {
    // Veri Modelleri
    const processorsData = [
        { id: 'proc-1', name: 'CPU', currentFile: null },
        { id: 'proc-2', name: 'GPU', currentFile: null },
        { id: 'proc-3', name: 'NPU', currentFile: null },
        { id: 'proc-4', name: 'RAM', currentFile: null },
        { id: 'proc-5', name: 'SSD', currentFile: null },
        { id: 'proc-6', name: 'Wi-Fi', currentFile: null }
    ];

    // 15 adet dosya olustur (6 sağlam, 5 virüs, 4 bozuk)
    const filesData = [];
    for(let i=0; i<6; i++) filesData.push({ id: `file-safe-${i}`, type: 'SAFE', desc: 'Sağlam Sistem Dosyası' });
    for(let i=0; i<5; i++) filesData.push({ id: `file-virus-${i}`, type: 'VIRUS', desc: 'Zararlı Yazılım (Virüs)' });
    for(let i=0; i<4; i++) filesData.push({ id: `file-broken-${i}`, type: 'BROKEN', desc: 'Bozuk Veri Kümesi' });

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
                alert(`Dosya Analizi:\nSonuç: ${fileObj.desc}`);
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
                const procObj = processorsData.find(p => p.id === selectedProcessorId);
                const procElement = document.getElementById(selectedProcessorId);
                
                // Eğer parça virüslü veya bozuksa, içini temizle (Virüs temizleme mekaniği)
                procObj.currentFile = null;
                procElement.classList.remove('infected', 'fixed', 'broken');
                procElement.innerText = procObj.name;

                // Önceki tüm fix modları temizle
                document.querySelectorAll('.processor').forEach(p => p.classList.remove('fix-mode'));
                
                // Seçilene ekle
                procElement.classList.add('fix-mode');
                selectedProcessorInfo.innerText = `${procObj.name} - Bekleniyor... (Dosya Sürükleyin)`;
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
                
                if (proc.currentFile === 'VIRUS') {
                    selectedProcessorInfo.innerText = `Seçilen: ${proc.name} (VİRÜS BULAŞMIŞ!)`;
                } else if (proc.currentFile === 'SAFE') {
                    selectedProcessorInfo.innerText = `Seçilen: ${proc.name} (Çalışıyor)`;
                } else {
                    selectedProcessorInfo.innerText = `Seçilen: ${proc.name} (Bozuk/Boş)`;
                }
                
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
                        div.classList.remove('fix-mode', 'broken', 'fixed', 'infected');
                        
                        if (fileObj.type === 'VIRUS') {
                            div.classList.add('infected');
                            div.innerText = `${proc.name}\n(VİRÜS!)`;
                            selectedProcessorInfo.innerText = `${proc.name} - VİRÜS BULAŞTI!`;
                        } else if (fileObj.type === 'SAFE') {
                            div.classList.add('fixed');
                            div.innerText = `${proc.name}\n(Hazır)`;
                            selectedProcessorInfo.innerText = `${proc.name} - Sistem kuruldu.`;
                        } else {
                            div.classList.add('broken');
                            div.innerText = `${proc.name}\n(Bozuk)`;
                            selectedProcessorInfo.innerText = `${proc.name} - Bozuk dosya atandı.`;
                        }
                        
                        fixBtn.disabled = true;
                    }
                } else {
                    alert("Önce donanımı seçip 'Düzelt' tuşuna basmalısınız!");
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
                } else if (proc.currentFile === 'VIRUS') {
                    hasError = true;
                    errorMsg = `KRİTİK HATA: ${proc.name} donanımına virüs bulaştı!`;
                    break;
                } else if (proc.currentFile === 'BROKEN') {
                    hasError = true;
                    errorMsg = `UYUMSUZLUK HATASI: ${proc.name} donanımına bozuk dosya yüklendi!`;
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
