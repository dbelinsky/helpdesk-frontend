/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */

import { formatedDate } from './formatedDate';

document.addEventListener('DOMContentLoaded', () => {
  const ticketList = document.querySelector('.ticket__container');
  const addTicketBtn = document.querySelector('.add__btn-ticket');
  const ticketModal = document.querySelector('.ticket__modal');
  const deleteModal = document.querySelector('.delete__modal');
  const closeButtons = document.querySelectorAll('.close__btn');
  const ticketForm = document.querySelector('.ticket__form');
  const confirmDeleteBtn = document.querySelector('.confirm__DeleteBtn');
  const cancelDeleteBtn = document.querySelector('.cancel__DeleteBtn');
  const loadingIcon = document.querySelector('.loading__icon');

  let currentTicketId = null;

  const apiUrl = 'https://helpdesk-backend-ef4y.onrender.com/api';

  function fetchTickets() {
    fetch(`${apiUrl}?method=allTickets`)
      .then((response) => response.json())
      .then(renderTickets);
  }

  // Функция для отрисовки списка тикетов
  function renderTickets(tickets) {
    ticketList.innerHTML = '';
    showLoadingIcon();
    tickets.forEach((ticket) => {
      const date = new Date(ticket.created);
      const formattedDate = formatedDate(date);
      const listItem = document.createElement('li');
      listItem.dataset.id = ticket.id;
      listItem.innerHTML = `
          <div class="ticket" data-id="${ticket.id}">
            <input type="checkbox" class="ticket__checkbox" ${ticket.status ? 'checked' : ''}>
            <div class="body__ticket">
              <h3>${ticket.name}</h3>
              <span>${formattedDate}</span>
            </div>

            <div class="btns">
              <button class="edit__Btn"> &#9998; </button>
              <button class="delete__Btn"> &#10006; </button>
            </div>

            <div class="show__description">
              <p></p>
            </div>
          </div>
        `;

      const checkbox = listItem.querySelector('.ticket__checkbox');
      if (checkbox) {
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleTicketStatus(ticket.id);
        });
      }

      const editBtn = listItem.querySelector('.edit__Btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openEditModal(ticket.id);
        });
      }

      const deleteBtn = listItem.querySelector('.delete__Btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openDeleteModal(ticket.id);
        });
      }

      const bodyTicket = listItem.querySelector('.body__ticket');
      if (bodyTicket) {
        bodyTicket.addEventListener('click', () => {
          showTicketDetails(ticket.id);
        });
      }
      ticketList.appendChild(listItem);
    });
    hideLoadingIcon();
  }

  // Функция для отображения подробностей тикета и показа описания
  function showTicketDetails(id) {
    fetch(`${apiUrl}?method=ticketById&id=${id}`)
      .then((response) => response.json())
      .then((ticket) => {
        const ticketElement = document.querySelector(`.ticket[data-id="${ticket.id}"]`);
        const showDescriptionElement = ticketElement.querySelector('.show__description');

        if (ticketElement.classList.contains('ticket__show')) {
          showDescriptionElement.style.display = 'none';
          ticketElement.classList.remove('ticket__show');
        } else {
          showDescriptionElement.querySelector('p').textContent = ticket.description;
          showDescriptionElement.style.display = 'block';
          ticketElement.classList.add('ticket__show');
        }
      // eslint-disable-next-line no-console
      }).catch((error) => console.error('Error fetching ticket details:', error));
  }

  function openEditModal(id) {
    fetch(`${apiUrl}?method=ticketById&id=${id}`)
      .then((response) => response.json())
      .then((ticket) => {
        currentTicketId = id;
        ticketModal.querySelector('.modal__title').innerText = 'Изменить тикет';
        ticketForm.querySelector('.ticket__id').value = ticket.id;
        ticketForm.querySelector('.input__text').value = ticket.name;
        ticketForm.querySelector('.textarea__description').value = ticket.description;
        ticketModal.style.display = 'block';
      });
  }

  function openDeleteModal(id) {
    currentTicketId = id;
    deleteModal.style.display = 'block';
  }

  // Функция для переключения статуса тикета
  function toggleTicketStatus(id) {
    fetch(`${apiUrl}?method=ticketById&id=${id}`)
      .then((response) => response.json())
      .then((ticket) => {
        ticket.status = !ticket.status;

        return fetch(`${apiUrl}?method=updateById&id=${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ticket),
        });
      })
      .then(fetchTickets);
  }

  function saveTicket(e) {
    e.preventDefault();
    const id = ticketForm.querySelector('.ticket__id').value;
    const name = ticketForm.querySelector('.input__text').value;
    const description = ticketForm.querySelector('.textarea__description').value;
    const method = id ? 'updateById' : 'createTicket';
    const url = id ? `${apiUrl}?method=${method}&id=${id}` : `${apiUrl}?method=${method}`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
      }),
    })
      .then(() => {
        ticketModal.style.display = 'none';
        fetchTickets();
      });
  }

  function confirmDelete() {
    fetch(`${apiUrl}?method=deleteById&id=${currentTicketId}`, {
      method: 'GET',
    })
      .then(() => {
        deleteModal.style.display = 'none';
        fetchTickets();
      });
  }

  function closeModal() {
    ticketModal.style.display = 'none';
    deleteModal.style.display = 'none';
  }

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  addTicketBtn.addEventListener('click', () => {
    ticketModal.querySelector('.modal__title').innerText = 'Добавить тикет';
    ticketForm.reset();
    ticketForm.querySelector('.ticket__id').value = '';
    ticketModal.style.display = 'block';
  });

  function showLoadingIcon() {
    loadingIcon.style.display = 'block';
  }

  function hideLoadingIcon() {
    loadingIcon.style.display = 'none';
  }

  ticketForm.addEventListener('submit', saveTicket);

  confirmDeleteBtn.addEventListener('click', confirmDelete);
  cancelDeleteBtn.addEventListener('click', closeModal);

  fetchTickets();
});