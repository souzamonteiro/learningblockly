var Nota1, Nota2, Media;Nota1 = Number(window.prompt('Informe a nota da unidade 1:'));Nota2 = Number(window.prompt('Informe a nota da unidade 2:'));Media = (Nota1 + Nota2) / 2;window.alert('Sua média é: ' + String(Media));if (Media >= 7) {  window.alert('Você foi aprovado!');} else {  window.alert('Você foi reprovado!');}