import { useEffect, useRef, useState } from 'react';

/**
 * Campo de texto controlado que se autoguarda: espera una pausa al escribir
 * (debounce) y, si el componente se desmonta antes de esa pausa (por ej. al
 * navegar a otra pantalla), guarda igual lo último escrito. Así nunca hace
 * falta tocar en otro lado para "confirmar" el texto.
 */
export function useTextField(
  valorInicial: string,
  guardar: (valor: string) => void,
  delayMs = 600
) {
  const [valor, setValor] = useState(valorInicial);
  const valorRef = useRef(valor);
  valorRef.current = valor;
  const guardarRef = useRef(guardar);
  guardarRef.current = guardar;
  const ultimoGuardadoRef = useRef(valorInicial);

  useEffect(() => {
    if (valor === ultimoGuardadoRef.current) return;
    const timeout = setTimeout(() => {
      ultimoGuardadoRef.current = valor;
      guardarRef.current(valor);
    }, delayMs);
    return () => clearTimeout(timeout);
  }, [valor, delayMs]);

  useEffect(() => {
    return () => {
      if (valorRef.current !== ultimoGuardadoRef.current) {
        guardarRef.current(valorRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [valor, setValor] as const;
}
