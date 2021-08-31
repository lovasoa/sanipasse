export interface TicketConfig {
	print: boolean;
	header?: string | null;
	footer?: string | null;
	width: number;
}

function getTicketHtml(
    name: String = "",
    date_of_birth: String = "",
    config: TicketConfig
  ): String{
  if(undefined == config.width){
    config.width = 90;
  }
  let html: String = `
<style type="text/css">
  body{
    width: `+config.width+`mm;
  }
  p{
    padding: 0;
    margin: 1mm;
  }
  input{
    border: none;
    border-bottom: 0.5mm dotted black;
    width: calc( `+config.width+`mm - 20mm );
  }
  article{
    margin: 2mm 0;
  }
  header pre,
  footer pre{
    text-align: center;
  }
</style>

<body>
  `;
  if(undefined != config.header){
    html = html.concat(
      `<header><pre>`,
      config.header,
      `</pre></header>`
    )
  }
  html = html.concat(`
  <article>
    <p>👤 `,name,`</p>
    <p>🎂 Né(e) le `,date_of_birth,`</p>
    <p>📱 Tél: <input></p>
    <p>✓ Vérifié le `,new Date().toLocaleString('fr-FR'),`</p>
  </article>
  `)
  if(undefined != config.footer){
    html = html.concat(
      `<footer><pre>`,
      config.footer,
      `</pre></footer>`
    )
  }
  html = html.concat(`
</body>
` )
  return html;
}

export async function printTicket(
    name: String = "",
    date_of_birth: String = "",
    config: TicketConfig
  ){
  const printingWindow = window.open("about:blank", 'Printing', 'width=350,height=300');
  printingWindow.onload = ()=>{
    printingWindow.document.title = "Sanipasse impression"
    printingWindow.document.body.innerHTML = getTicketHtml(name, date_of_birth, config);
    printingWindow.print();
    printingWindow.close();
  }
}