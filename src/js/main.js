document.addEventListener("DOMContentLoaded", () => {



  const headerLinks = document.querySelectorAll(".header__list li");
  if (headerLinks[0]) {
    headerLinks.forEach((headerLink) => {
      const classList = headerLink.classList;
      let suffix = "";

      classList.forEach((className) => {
        if (className.startsWith("header__hover_")) {
          suffix = className.split("header__hover_")[1];
        }
      });

      // Формируем селектор для подменю с использованием суффикса
      const submenuSelector = `.header__submenu[data-name="${suffix}"]`;
      const submenu = document.querySelector(submenuSelector);

      headerLink.addEventListener("mouseenter", () => {
        if (submenu) {
          submenu.classList.add("active");
        }
      });

      headerLink.addEventListener("mouseleave", () => {
        if (submenu) {
          setTimeout(() => {
            if (!submenu.matches(":hover")) {
              submenu.classList.remove("active");
            }
          }, 200);
        }
      });

      // Обработчик для подменю, чтобы оно не закрывалось при наведении
      if (submenu) {
        submenu.addEventListener("mouseenter", () => {
          submenu.classList.add("active");
        });

        submenu.addEventListener("mouseleave", () => {
          submenu.classList.remove("active");
        });
      }
    });
  }

  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  if (phoneInputs[0]) {
    phoneInputs.forEach((phoneInput) => {
      phoneInput.addEventListener("input", function (e) {
        // Удаляем все нецифровые символы
        let cleaned = ("" + e.target.value).replace(/\D/g, "");

        // Проверяем, начинается ли номер с 7 или 8 (российские номера)
        if (cleaned.startsWith("7") || cleaned.startsWith("8")) {
          cleaned = cleaned.substring(1); // Убираем первую цифру (7 или 8)
        }

        // Ограничиваем длину номера до 10 цифр
        if (cleaned.length > 10) {
          cleaned = cleaned.substring(0, 10);
        }

        // Форматируем номер в маску +7 (---) --- - -- - --
        let formatted = "+7 (";

        for (let i = 0; i < cleaned.length; i++) {
          if (i === 3) {
            formatted += ") ";
          } else if (i === 6) {
            formatted += " - ";
          } else if (i === 8) {
            formatted += " - ";
          }
          formatted += cleaned[i];
        }

        // Устанавливаем отформатированное значение в поле ввода
        e.target.value = formatted;
      });

      // Обработка события вставки (например, через Ctrl+V)
      phoneInput.addEventListener("paste", function (e) {
        e.preventDefault(); // Отменяем стандартное поведение
        const pastedText = (e.clipboardData || window.clipboardData).getData(
          "text"
        );
        phoneInput.value = pastedText; // Вставляем текст
        phoneInput.dispatchEvent(new Event("input")); // Триггерим событие input
      });
    });
  }

  const pSelects = document.querySelectorAll(".p-form__select");
  if (pSelects[0]) {
    pSelects.forEach((pSelect) => {
      const current = pSelect.querySelector(".p-form__select-current");
      const input = pSelect.querySelector(".p-form__select-input");
      const title = pSelect.querySelector(".p-form__select-title");
      const items = pSelect.querySelectorAll(".p-form__select-item");

      current.addEventListener("click", function () {
        const active = document.querySelector(".p-form__select.active");
        if (active && active !== pSelect) {
          active.classList.remove("active");
        }

        pSelect.classList.toggle("active");
      });

      items.forEach((item) => {
        item.addEventListener("click", function () {
          title.textContent = item.dataset.title;
          title.classList.add("active");
          pSelect.classList.remove("active");

          if (item.dataset.value) {
            input.value = item.dataset.value;
          }
        });
      });
    });
  }

  const modalMenu = document.querySelector(".modal_menu");
  if (modalMenu) {
    const linksOfChildrens = modalMenu.querySelectorAll(
      ".menu-item-has-children"
    );
    const links = modalMenu.querySelectorAll("li");
    if (links[0]) {
      links.forEach((link) => {
        if (!link.classList.contains("menu-item-has-children")) {
          const a = link.querySelector("a");
          a.addEventListener("click", () => {
            modalMenu.classList.remove("active");
            document.body.style.overflow = "";
          });
        }
      });
    }
    if (linksOfChildrens[0]) {
      linksOfChildrens.forEach((linksOfChildren) => {
        const a = linksOfChildren.querySelector("a");
        click(a);

        function click(item) {
          item.addEventListener("click", (e) => {
            e.preventDefault();

            const submenu = linksOfChildren.querySelector(
              ".modal_menu__sublist"
            );
            if (submenu) {
              submenu.classList.toggle("active");

              if (submenu.classList.contains("active")) {
                submenu.style.height = submenu.scrollHeight + "px";
              } else {
                submenu.style.height = "";
              }
            }
          });
        }
      });
    }
  }

  function addModal(element) {
    element.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function removeModal(element) {
    element.classList.remove("active");
    document.body.style.overflow = "";
  }

  function resetEvent(e) {
    e.preventDefault();
  }

  class PovlyModal {
    constructor() {
      this.allModals();
      this.allModalShows();
    }

    allModals() {
      const modals = document.querySelectorAll(".modal");
      modals.forEach((modal) => {
        function eventClose() {
          const event = new CustomEvent("pModalClose", {
            detail: {
              modal: modal,
            },
          });
          document.dispatchEvent(event);
        }

        function remove() {
          removeModal(modal);
          document.body.style.overflow = "";
          eventClose();
        }

        const closes = modal.querySelectorAll(".modal__close");
        if (closes[0]) {
          closes.forEach((close) => {
            close.addEventListener("click", () => {
              remove();
            });
          });
        }

        const back = modal.querySelector(".modal__back");
        if (back) {
          back.addEventListener("click", () => {
            remove();
          });
        }
        modal.addEventListener("click", (e) => {
          if (e.target == modal) {
            remove();
          }
        });
      });
    }

    allModalShows() {
      const modalShows = document.querySelectorAll(".modal__show");
      modalShows.forEach((modal) => {
        modal.addEventListener("click", (e) => {
          resetEvent(e);
          const dataModal = modal.getAttribute("data-modal");
          const _modal = document.querySelector(".modal_" + dataModal);
          addModal(_modal);
          // document.body.style.overflow = "hidden";

          const event = new CustomEvent("pModalOpen", {
            detail: {
              modal: _modal,
              element: modal,
            },
          });
          document.dispatchEvent(event);
        });
      });
    }
  }

  new PovlyModal();
});
