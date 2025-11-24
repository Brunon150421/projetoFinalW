function carregarExames() {
  const lista = document.getElementById("listaFinalExames");
  const exames = JSON.parse(localStorage.getItem("exames")) || [];

  lista.innerHTML = "";

  if (exames.length === 0) {
    lista.innerHTML = "<p>Nenhum exame enviado ainda.</p>";
    return;
  }

  exames.forEach(ex => {
    lista.innerHTML += `
      <div class="pasta">
        <h3>${ex.nome}</h3>
        <p><strong>Categoria:</strong> ${ex.categoria}</p>
        <p><strong>Data:</strong> ${ex.data}</p>
        <p><strong>Idoso:</strong> ${ex.idoso}</p>
        <p><strong>Arquivo:</strong> ${ex.arquivoNome}</p>
        <p><strong>Informações:</strong> ${ex.info}</p>

        <button onclick="excluirExame(${ex.id})">Excluir</button>
      </div>
    `;
  });
}

function excluirExame(id) {
  let exames = JSON.parse(localStorage.getItem("exames")) || [];
  exames = exames.filter(ex => ex.id !== id);
  localStorage.setItem("exames", JSON.stringify(exames));
  carregarExames();
}

window.onload = carregarExames;