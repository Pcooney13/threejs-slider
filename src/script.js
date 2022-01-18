import "./assets/tailwind.css";
import gsap from "gsap";
import Sketch from "./threejs.js";

window.onload = function () {
    const sketch = new Sketch({
        dom: document.getElementById("container"),
    });

    let height = window.innerHeight;
    let width = window.innerWidth;
    let speed = 0;
    let position = 0;
    let rounded = 0;

    let attractMode = false;
    let attractTo = 0;

    let container = document.getElementById("container");
    let wrap = document.getElementById("wrap");
    let menuList = [...document.querySelectorAll("#menu-nav li")];
    let elems = [...document.querySelectorAll(".n")];

    console.log(menuList);

    addEventListener("wheel", (e) => {
        speed += e.deltaY * 0.00027;
    });

    let objs = Array(5).fill({ dist: 0 });

    function raf() {
        position += speed;
        speed *= 0.75;
        
        objs.forEach((o, i) => {
            o.dist = Math.min(Math.abs(position - i), 1);
            o.dist = 1 - o.dist ** 2;
            elems[i].style.transform = `scale(${1 + 0.4 * o.dist})`;
            let scale = 1 + 0.2 * o.dist;
            sketch.meshes[i].position.y = i * 1.2 - position * 1.2;
            sketch.meshes[i].scale.set(scale, scale, scale);
            sketch.meshes[i].material.uniforms.distanceFromCenter.value = o.dist;
            menuList[i].style.opacity = "50%"
        });
        menuList[Math.min(Math.max(Math.round(position), 0), 4)].style.opacity = "100%";
        
        rounded = Math.round(Math.abs(position));

        if (rounded > objs.length - 1) rounded = objs.length - 1;
        
        let diff = rounded - position;

        if (attractMode) {
            position += -(position - attractTo) * 0.05;
        } else {
            position += Math.sign(diff) * Math.pow(Math.abs(diff), 0.5) * 0.03;

            wrap.style.transform = `translate(0, -${position * height + 50}px)`;
        }

    elems.forEach((el) => {
      el.style.opacity = "0%";
    });
    if (elems[rounded]) {
      container.style.background = elems[rounded].dataset.bgcolor;
      elems[rounded].style.opacity = "100%";
      elems[rounded].children[0].style.textShadow =
        "1px 1px " + elems[rounded].dataset.bgcolor;
      elems[rounded].children[0].style.color = elems[rounded].dataset.textcolor;
    }

    window.requestAnimationFrame(raf);
  }

  raf();

  let navs = [...document.querySelectorAll("li")];
  let nav = document.querySelector(".nav");
  let camera = sketch.camera.position;
  console.log(camera);
  let rots = sketch.groups.map((e) => e.rotation);
  nav.addEventListener("mouseenter", () => {
    attractMode = true;
    gsap.to(rots, {
      duration: 0.3,
      x: -0.5,
      y: -0.0,
      z: -0.0,
    });
    gsap.to(camera, {
      duration: 0.3,
      x: 0,
    });
  });
  nav.addEventListener("mouseleave", () => {
    attractMode = false;
    gsap.to(rots, {
      duration: 0.3,
      x: -0.3,
      y: -0.3,
      z: -0.3,
    });
    gsap.to(camera, {
      duration: 0.3,
      x: -0.625,
    });
  });

  navs.forEach((el) => {
    el.addEventListener("mouseover", (e) => {
      // console.log(e.target.dataset.nav);
      attractTo = e.target.dataset.nav;
    });
  });

};
