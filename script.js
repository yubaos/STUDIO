const grid = document.getElementById('grid');

document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - .5) * 2;
  const y = (e.clientY / window.innerHeight - .5) * 2;

  grid.style.transform =
    `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
});
