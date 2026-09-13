# kompila lead recovery · v2 (mockup)

12 set 2026 · v2.1. **A IA opera; a empresa acompanha.** Uma coisa grande por tela, card de um número, lista de uma linha. Abrir `index.html`.

- Trocar de cliente no topo (P1LED, MRV) ou por URL: `index.html?co=mrv`
- Ver como gerente ou como uma pessoa do time no topo, ou por URL: `?ver=g` (gerente) · `?ver=bea` (Beatriz)
- Sem servidor. O que você mexe fica no localStorage; "Zerar exemplo" limpa.

| Tela | Gerente | Vendedor |
|---|---|---|
| `index.html` | **Agora**: status da IA, o que ela fez hoje, o que travou esperando gente, diário | **Meu resultado**: leads recebidos, o que a IA pediu, visitas, propostas, fechado, eu × time |
| `pipeline.html` | **Pipeline**: kanban com as fases do cliente (Conector › Pipeline) | **Meu pipeline**: só os dele |
| `fila.html` | **Fila**: tudo parado esperando pessoa, por motivo | **Precisa de mim**: só o dele |
| `conversa.html` | todas | só as dele |
| `leads.html` | todos, estado dado pela IA | só os dele |
| `equipe.html` | por pessoa: chamadas da IA, tempo pra resolver, visitas, propostas, fechado | não vê |
| `resultado.html` | dinheiro, funil da IA, custo IA × pessoas, perdas | não vê |
| `conector.html` | **Conector <cliente>**: o que a IA faz sozinha / pede / nunca, quando chama gente, motores, templates, tom, chave | não vê |

Código: `assets/k.js` (casca e telas), `assets/dados.js` (um bloco por cliente: time, regras, motores, templates, leads de exemplo), `assets/k.css`.

O que mudou em relação à v1 e por quê: `MUDANCAS.md`.
