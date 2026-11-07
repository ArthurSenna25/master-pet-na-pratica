Campo de formulário com rótulo fixo acima, dica abaixo e foco com halo azul-bebê.

```jsx
<Input label="WhatsApp" prefix="+55" placeholder="(11) 90000-0000" hint="Só usamos para confirmar o diagnóstico." />
<Input label="E-mail" error="Confira o endereço — falta o @." defaultValue="camila.exemplo.com" />
<Input label="Sobre o seu negócio" multiline optional />
```

Estados: padrão, hover, focus, filled, error, success, disabled (tracejado), readOnly. Erro/sucesso sempre com glifo + texto.
