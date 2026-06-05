import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Sube a 100 usuarios en los primeros 30 segundos
    { duration: '30s', target: 500 }, // Escala drásticamente a 500 usuarios
    { duration: '1m', target: 1000 }, // Llega al pico de 1000 usuarios y se mantiene 1 minuto
    { duration: '20s', target: 0 },   // Baja a 0 usuarios (enfriamiento)
  ],
  // Ponemos un umbral para que el test falle automáticamente si los tiempos se vuelven inaceptables
  thresholds: {
    http_req_duration: ['p(95)<1500'], // El 95% de las peticiones debe tardar menos de 1.5 segundos
    http_req_failed: ['rate<0.05'],    // Los errores no deben superar el 5%
  },
};

export default function () {
  // Asegúrate de que esta sea una ruta que haga una consulta real a tu BD
  // Si la página está en caché estática, aguantará millones sin problema.
  const res = http.get('http://localhost:3000/raffle/5b37fac6-5215-4839-976e-a9e4dd02968e');

  check(res, {
    'status fue 200': (r) => r.status == 200,
  });

  // La pausa es crucial para no agotar los puertos locales de tu computadora (Windows)
  sleep(1);
}