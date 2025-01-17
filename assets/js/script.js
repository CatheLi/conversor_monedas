const montoInput = document.getElementById("monto");
const monedaSelect = document.getElementById("moneda");
const convertirButton = document.getElementById("convertir");
const resultadoDiv = document.getElementById("resultado");
const graficoDiv = document.getElementById("grafico");
let monedaSeleccionada = 0;
let tipoDeCambio = 0;
let graficoInstance = null;

monedaSelect.addEventListener("change", () => {
  monedaSeleccionada = monedaSelect.value;
});

const obtenerTipoDeCambio = async () => {
  try {
    const respuesta = await fetch("https://mindicador.cl/api/");
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.log(error);
  }
};

const seleccionarOpcion = async () => {
    try {
      const datos = await obtenerTipoDeCambio();
      if (monedaSeleccionada == "dolar") {
        return datos.dolar.valor;
      } else if (monedaSeleccionada == "euro") {
        return datos.euro.valor;
      } else if (monedaSeleccionada == "uf") {
        return datos.uf.valor;
      } 
    } catch (error) {
      console.log(error);
    }
  };
  
  convertirButton.addEventListener("click", async () => {
    try {
      const monto = parseFloat(montoInput.value);
      if (monedaSeleccionada == "-") {
        if (graficoInstance) {
          graficoInstance.destroy();
          graficoInstance = null; // Reinicia la instancia
        }
        const grafico = document.getElementById("grafico");
        grafico.style.backgroundColor = "";
        grafico.innerHTML = ""; // Limpia el contenido del canvas
        resultadoDiv.textContent = "";
        return;
      }
      const tipoDeCambio = await seleccionarOpcion();
      if (tipoDeCambio) {
        const resultado = monto / tipoDeCambio;
        resultadoDiv.textContent = `Resultado: ${resultado.toFixed(2)}`;
        renderizarGrafico();
      }
    } catch (error) {
      console.log(error);
    }
  });
  
  async function obtenerDatosGrafico() {
    try {
      const añoActual = new Date().getFullYear(); 
      let respuesta;
      if (monedaSeleccionada == "dolar") {
        respuesta = await fetch(`https://mindicador.cl/api/dolar/${añoActual}`); 
      } else if (monedaSeleccionada == "euro") {
        respuesta = await fetch(`https://mindicador.cl/api/euro/${añoActual}`); 
      } else if (monedaSeleccionada == "uf") {
        respuesta = await fetch(`https://mindicador.cl/api/uf/${añoActual}`); 
      } else {
        resultadoDiv.textContent = "Ingrese moneda válida.";
        return;
      }
  
      const datos = await respuesta.json();
      const etiquetas = datos.serie.map(item => ({ fecha: item.fecha, valor: item.valor })).reverse();
      const fechaHoy = new Date();
      const fechaMinima = new Date(fechaHoy.setDate(fechaHoy.getDate() - 10));
      fechaHoy.setDate(fechaHoy.getDate() + 10);
      const datosFiltrados = etiquetas.filter(element => {
        const fecha = new Date(element.fecha);
        return fecha > fechaMinima && fecha <= fechaHoy;
      });
      const fechas = datosFiltrados.map(element => element.fecha);
      const valores = datosFiltrados.map(element => element.valor);
      const conjuntosDeDatos = [{ label: "Historial últimos 10 días", borderColor: "rgb(255, 99, 132)", data: valores }];
      return { labels: fechas, datasets: conjuntosDeDatos };
    } catch (error) {
      console.log(error);
    }
  }
  
  async function renderizarGrafico() {
    const datos = await obtenerDatosGrafico();
    if (datos) {
      if (graficoInstance) {
        graficoInstance.destroy();
      }
  
      const configuracion = { type: "line", data: datos };
      const grafico = document.getElementById("grafico");
      grafico.style.backgroundColor = "white";
      graficoInstance = new Chart(grafico, configuracion);
    }
  }