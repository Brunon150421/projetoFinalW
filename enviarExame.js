/// DRAG & DROP
const areaEnvio = document.getElementById("areaEnvio");
const inputExame = document.getElementById("envioExame");
const listaExames = document.getElementById("listaExames");

areaEnvio.addEventListener("click", () => inputExame.click());

inputExame.addEventListener("change", () => mostrarArquivos(inputExame.files));

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  areaEnvio.addEventListener(eventName, (e) => e.preventDefault());
});

areaEnvio.addEventListener("dragover", () => areaEnvio.classList.add("dragover"));
areaEnvio.addEventListener("dragleave", () => areaEnvio.classList.remove("dragover"));

areaEnvio.addEventListener("drop", (e) => {
  areaEnvio.classList.remove("dragover");
  mostrarArquivos(e.dataTransfer.files);
});

function mostrarArquivos(files) {
  listaExames.innerHTML = "";
  [...files].forEach(file => {
    listaExames.innerHTML += `<p>📄 ${file.name}</p>`;
  });
}

//SALVAR NO LOCALSTORAGE 

function salvarExame() {
  const idoso = document.getElementById("idIdoso").value;
  const nome = document.getElementById("nomeExame").value;
  const categoria = document.getElementById("filtros").value;
  const data = document.getElementById("dataExame").value;
  const info = document.getElementById("infoAd").value;
  const arquivos = inputExame.files;

  if (!idoso || !nome || !categoria || !data || arquivos.length === 0) {
    alert("Preencha todos os campos e envie o arquivo do exame!");
    return;
  }

  let examesSalvos = JSON.parse(localStorage.getItem("exames")) || [];

  [...arquivos].forEach(arq => {
    examesSalvos.push({
      id: Date.now(),
      nome,
      categoria,
      data,
      info,
      idoso,
      arquivoNome: arq.name
    });
  });

  localStorage.setItem("exames", JSON.stringify(examesSalvos));

  alert("Exame enviado com sucesso!");
}