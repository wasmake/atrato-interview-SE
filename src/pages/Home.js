import "../App.css";
import { useState, useEffect } from "react";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import $ from "jquery";

const Home = () => {
  const [originalData, setOriginalData] = useState([]);
  const [data, setData] = useState(null);
  const [idOrdered, setIdOrdered] = useState(false);
  const [nameOrdered, setNameOrdered] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [error, setError] = useState(null);

  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(false);

  const [userStates, setUserStates] = useState([
    "Pendiente",
    "Aprovado",
    "Rechazado",
    "En proceso",
  ]); // This could be retrived from the backend

  const [originalUserStates, setOriginalUserStates] = useState([
    "Pendiente",
    "Aprovado",
    "Rechazado",
    "En proceso",
  ]); // This could be retrived from the backend

  useEffect(() => {
    axios
      .get("http://localhost:5000/users")
      .then((res) => {
        setData(res.data);
        setOriginalData(res.data);
        addEventToCheckboxes();
      })
      .catch((err) => {
        setError(err);
      });
  }, []);

  // Function to beautify the status of the user and add a font-awesome icon
  // PENDIENTE -> <i className="fas fa-hourglass-half"></i> Pendiente
  // APROBADO -> <i className="fas fa-check-circle"></i> Aprobado
  // RECHAZADO -> <i className="fas fa-times-circle"></i> Rechazado
  // EN_PROCESO -> <i className="fas fa-spinner"></i> En proceso
  const beautifyStatus = (status) => {
    switch (status) {
      case "PENDIENTE":
        return (
          <span className="badge status-pending">
            <i className="fas fa-hourglass-half"></i> Pendiente
          </span>
        );
      case "APROBADO":
        return (
          <span className="badge status-approved">
            <i className="fas fa-check-circle"></i> Aprobado
          </span>
        );
      case "RECHAZADO":
        return (
          <span className="badge status-rejected">
            <i className="fas fa-times-circle"></i> Rechazado
          </span>
        );
      case "EN_PROCESO":
        return (
          <span className="badge status-inprogress">
            <i className="fas fa-spinner"></i> En proceso
          </span>
        );
      default:
        return (
          <span className="badge status-unknown">
            <i className="fas fa-question-circle"></i> Desconocido
          </span>
        );
    }
  };

  // Function to do an onClick to check every checkbox of the table
  const checkAll = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    // Checkbox with id "checkMass" to check/uncheck all checkboxes
    const checkMass = document.getElementById("checkMass");
    checkboxes.forEach((checkbox) => {
      checkbox.checked = checkMass.checked;
    });
  };

  // Function to order the rows by the name of the user
  const orderByName = () => {
    const nameHead = document.getElementById("nameField");
    if (nameOrdered) {
      // Reverse the order of the array
      nameHead.innerHTML = 'Nombre <i class="fa-solid fa-sort-down"></i>';
      const reversed = [...data].reverse();
      setData(reversed);
    } else {
      // Order the array by the name of the user
      nameHead.innerHTML = 'Nombre <i class="fa-solid fa-sort-up"></i>';
      const sorted = [...data].sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      setData(sorted);
    }
    setNameOrdered(!nameOrdered);
  };

  const orderById = () => {
    const idHead = document.getElementById("idField");
    if (idOrdered) {
      // Reverse the order of the array
      idHead.innerHTML = 'ID <i class="fa-solid fa-sort-down"></i>';
      const reversed = [...data].reverse();
      setData(reversed);
    } else {
      // Order the array by the id of the user
      idHead.innerHTML = 'ID <i class="fa-solid fa-sort-up"></i>';
      const sorted = [...data].sort((a, b) => {
        if (a.id < b.id) {
          return -1;
        }
        if (a.id > b.id) {
          return 1;
        }
        return 0;
      });
      setData(sorted);
    }
    setIdOrdered(!idOrdered);
  };

  // Add an event to every checkbox for when they change value to checked
  const addEventToCheckboxes = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]'); // Easy hack since we dont have pagination
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (event) => {
        // Filter all checkboxes that are checked
        const checked = [...checkboxes].filter((checkbox) => checkbox.checked);
        // If there are no checkboxes checked, disable the button
        if (!event.target.checked && $("#checkMass").is(":checked")) {
          $("#checkMass").prop("checked", false);
        }
        if (checked.length === checkboxes.length - 1) {
          $("#checkMass").prop("checked", true);
        }
        if (checked.length === 0) {
          $("#deleteButton").prop("disabled", true);
        }
        // If there are checkboxes checked, enable the button
        else {
          $("#deleteButton").prop("disabled", false);
        }
      });
    });
    $("#deleteButton").prop("disabled", true);
  };

  const addFilter = (filter) => {
    const newFilters = [...activeFilters, filter];
    setActiveFilters(newFilters);
    const newUserStates = userStates.filter((filt) => filt !== filter); // Remove the filter from the userStates array
    setUserStates(newUserStates);
    applyFilers(filter);
  };

  const removeFilter = (filter) => {
    const newFilters = activeFilters.filter((filt) => filt !== filter);
    setActiveFilters(newFilters);
    const newUserStates = [...userStates, filter]; // Add the filter to the userStates array
    setUserStates(newUserStates);
    applyFilers(filter);
  };

  const applyFilers = (filter) => {
    const filters = activeFilters.map((filter) =>
      filter.toLowerCase().replace(" ", "_")
    );
    const filtered = originalData.filter((user) => {
      // Active filters to lowercase and replace spaces with underscores
      // If the user's status is in the filters array, return true
      filter = filter.toLowerCase().replace(" ", "_");
      if (filter === user.status.toLowerCase() && filters.includes(filter)) {
        // Removing filter event
        return false;
      }
      if (filters.includes(user.status.toLowerCase())) {
        // On the normal active filters
        return true;
      }
      if (filter === user.status.toLowerCase() && !filters.includes(filter)) {
        // Adding filter event
        return true;
      }
      // If the user's status is not in the filters array, return false
      return false;
    });
    if (filtered.length === 0 && activeFilters.length === 1) {
      setData(originalData);
    } else {
      setData(filtered);
    }
  };

  // Function to delete only one user
  const deleteUser = (id, event) => {
    if (event) event.preventDefault();

    id = Number(id);

    // Delete the user from the database
    axios
      .delete("http://localhost:5000/users", {
        data: {
          ids: [id],
        },
      })
      .then((res) => {
        // If the user was deleted successfully status 200
        if (res.status === 200) {
          // Delete the user from the data array
          const newData = data.filter((user) => user.id !== id);
          setData(newData);
          toast.success("Usuario eliminado correctamente");
        }
      })
      .catch((err) => {
        toast.error("Error al eliminar el usuario");
      });
  };

  // Function to delete the selected users
  const deleteUsers = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checked = [...checkboxes].filter((checkbox) => checkbox.checked);
    const ids = checked.map((checkbox) => Number(checkbox.id));
    // Delete the users from the database
    axios
      .delete("http://localhost:5000/users", {
        data: {
          ids: ids,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          // Delete the users from the table
          const newData = data.filter((user) => !ids.includes(user.id));
          setData(newData);
          // Disable the button
          $("#deleteButton").prop("disabled", true);
          // If checkMass is checked, uncheck it
          if ($("#checkMass").is(":checked")) {
            $("#checkMass").prop("checked", false);
            toast.success("Todos los usuarios fueron eliminados correctamente");
          } else {
            toast.success(
              "Los usuarios seleccionados fueron eliminados correctamente"
            );
          }
        }
      })
      .catch((err) => {
        toast.error("Error al eliminar los usuarios seleccionados");
      });
  };

  const createUser = (event) => {
    // Remove default behaviour of the form
    event.preventDefault();

    // Get all values from the form
    const name = document.getElementById("name").value;
    const lastname = document.getElementById("lastname").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const status = document.getElementById("status").value;
    const birthday = document.getElementById("birthday").value;
    const assignedAnalyst = document.getElementById("assignedAnalyst").value;

    let user = {
      name: name,
      lastname: lastname,
      email: email,
      phone: phone,
      status: status,
      birthday: birthday,
      assignedAnalyst: assignedAnalyst,
    };

    // Fetch the API to post to /user with axios
    axios
      .post("http://localhost:5000/user", user)
      .then((res) => {
        // Check if the response is successful
        if (res.status === 200) {
          // Add the new user to the data array
          const newData = [...data, res.data.user];
          setData(newData);
          event.target.reset();
          toast.success("Usuario creado con éxito");
          // Close the bootstrap modal
          $("#addUserModalClose").trigger("click");
        }
      })
      .catch((err) => {
        if (!err.response) return;

        if (err.response.status === 400) {
          toast.error(err.response.data.message);
        }
        // Close the bootstrap modal
        $("#addUserModalClose").trigger("click");
      });
  };

  const updateUser = (event) => {
    const id = viewUser.id;
    event.preventDefault();

    if (!editUser) {
      setEditUser(true);
    } else {
      // Get all values from the form
      const form = document.getElementById("updateUserForm");
      const name = form.name.value;
      const lastname = form.lastname.value;
      const email = form.email.value;
      const phone = form.phone.value;
      const status = form.status.value.toUpperCase().replace(" ", "_");
      const birthday = form.birthday.value;
      const assignedAnalyst = form.assignedAnalyst.value;

      let user = {
        id: Number(id),
        name: name,
        lastname: lastname,
        email: email,
        phone: phone,
        status: status,
        birthday: birthday,
        assignedAnalyst: assignedAnalyst,
      };

      // Fetch the API to put to /user with axios
      axios
        .put("http://localhost:5000/user", user)
        .then((res) => {
          // Check if the response is successful
          if (res.status === 200) {
            // Update the user in the data array
            const newData = data.map((user) => {
              if (user.id === Number(id)) {
                return res.data.user;
              }
              return user;
            });
            setData(newData);
            toast.success("Usuario actualizado con éxito");
            // Close the bootstrap modal
            $("#viewUserModalClose").trigger("click");
          }
        })
        .catch((err) => {
          if (!err.response) return;

          if (err.response.status === 400) {
            toast.error(err.response.data.message);
          }
          // Close the bootstrap modal
          $("#viewUserModalClose").trigger("click");
        });
    }
  };

  const setViewUserForModal = (id) => {
    const form = document.getElementById("updateUserForm");
    // Reset form
    form.reset();
    // Get the user from the data array
    const user = data.find((user) => user.id === id);
    // Set the user to the viewUser state
    setViewUser(user);
    // Reset editUser state
    setEditUser(false);

    // Set the values of the form
    form.querySelectorAll("input").forEach((input) => {
      const id = input.id;
      if (id === "cvv" || id === "pin" || id === "expiration") return;

      if (input.id === "name") {
        const middlename = user.middleName ?? "";
        input.value = user.name + " " + middlename;
      } else if (input.id === "lastname") {
        input.value = user.fLastName + " " + user.sLastName;
      } else {
        input.value = user[input.id];
      }
    });

    const select = form.status;
    const status = stringifyStatus(user.status);
    // Set the value and selected option of the select to the status of the user
    select.value = status;
    
    // Get the index of the status in the options array
    const index = [...select.options].findIndex(
      (option) => option.value === status
    );

    // Set the selected option of the select to the status of the user
    select.options[index].selected = true;


  };

  const stringifyStatus = (status) => {
    return status.toLowerCase().replace("_", " ");
  };

  // Format date to dd/mm/yy
  const beautifyDate = (date) => {
    const dateObj = new Date(date);
    // Stringify the date to dd/mm/yy
    const dateString = dateObj.toLocaleDateString("es-ES");
    return dateString;
  };

  const equalsStatus = (a, b) => {
    const aStatus = a.toLowerCase().replace(" ", "_");
    const bStatus = b.toLowerCase().replace(" ", "_");
    return aStatus === bStatus;
  };

  return (
    <div className="container">
      <ToastContainer />
      <div className="inner-container">
        <h3>Manejo de Usuarios</h3>
        <div className="row buttonsRight">
          <div className="col-6" id="filters">
            <div className="activeFilters">
              Filtros activos:
              {activeFilters.map((filter) => {
                return (
                  <span
                    className="badge badge-filter"
                    key={filter}
                    onClick={() => removeFilter(filter)}
                  >
                    {filter} <i className="fa-regular fa-circle-xmark"></i>
                  </span>
                );
              })}
            </div>
          </div>
          <div className="col-6 rightText">
            <div className="btn-group">
              <a
                href="/#"
                className="btn statusFilter dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Añadir filtro de estado
              </a>
              <ul className="dropdown-menu">
                {userStates.map((state, index) => {
                  return (
                    <li key={index}>
                      <a
                        href="/#"
                        className="dropdown-item"
                        onClick={() => addFilter(state)}
                      >
                        {state}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <button
              type="button"
              id="addButton"
              data-bs-toggle="modal"
              data-bs-target="#addUserModal"
              className="btn btn-success"
            >
              <i className="fa-solid fa-user-plus"></i> Añadir usuario
            </button>
            <button
              type="button"
              id="deleteButton"
              className="btn btn-danger"
              onClick={() => deleteUsers()}
            >
              <i className="fa-regular fa-trash-can"></i> Eliminar
              selecionado(s)
            </button>
          </div>
        </div>

        <div className="grey-container">
          <div className="inner-container table-responsive">
            <table className="table" id="table">
              <thead>
                <tr>
                  <th scope="col">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value=""
                        id="checkMass"
                        onClick={checkAll}
                      />
                    </div>
                  </th>
                  <th>
                    <a href="/#" onClick={orderById} id="idField">
                      ID <i className="fa-solid fa-sort"></i>
                    </a>
                  </th>
                  <th>
                    <a href="/#" onClick={orderByName} id="nameField">
                      Nombre <i className="fa-solid fa-sort"></i>
                    </a>
                  </th>
                  <th>Email</th>
                  <th className="centerText">Estado</th>
                  <th className="centerText">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            id={user.id}
                          />
                        </div>
                      </td>
                      <td>{user.id}</td>
                      <td>
                        {user.name} {user.middleName} {user.fLastName}{" "}
                        {user.sLastName}
                      </td>
                      <td>{user.email}</td>
                      <td className="centerText">
                        {beautifyStatus(user.status)}
                      </td>
                      <td className="centerText">
                        <button
                          data-bs-toggle="modal"
                          data-bs-target="#viewUserModal"
                          onClick={() => setViewUserForModal(user.id)}
                          type="button"
                          className="btn btn-outline-primary"
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => deleteUser(user.id, this)}
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="viewUserModal"
        tabindex="-1"
        aria-labelledby="viewUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content grey-modal">
            <div className="padding-20">
              <form onSubmit={updateUser} id="updateUserForm">
                <div className="modal-body">
                  <div className="row padding-tb8">
                    <button
                      type="button"
                      className="btn modal-close"
                      data-bs-dismiss="modal"
                      id="viewUserModalClose"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-lg-2 d-none d-xl-block">
                      <div className="modal-avatar">
                        <i className="fa-solid fa-user"></i>
                      </div>
                    </div>
                    <div className="col-xl-7 col-lg-9 col-md-12">
                      <div className="row">
                        <div className={!editUser ? "col-12" : "col"}>
                          {!editUser && viewUser ? (
                            <h3 className="modal-title" id="viewUserModalLabel">
                              {viewUser.name} {viewUser.middleName}{" "}
                              {viewUser.fLastName} {viewUser.sLastName}
                            </h3>
                          ) : (
                            ""
                          )}
                          <input
                            id="name"
                            type="text"
                            className="form-control custom-input"
                            placeholder="Nombre(s)"
                            aria-label="First and middle name"
                            required={true}
                            hidden={!editUser}
                          />
                        </div>
                        <div className={!editUser ? "col-0" : "col"}>
                          <input
                            id="lastname"
                            type="text"
                            className="form-control custom-input"
                            placeholder="Apellido(s)"
                            aria-label="Last name"
                            required={true}
                            hidden={!editUser}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <p className="userId">
                          ID:
                          <span id="userId">
                            {" "}
                            {viewUser ? viewUser.id : ""}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-4 rightText">
                      <div id="selector" className="selector-container">
                        <select id="status" className="form-control selector-box" defaultValue="Estatus" disabled={!editUser}>
                          <option value="" hidden>
                            Estatus
                          </option>
                          {originalUserStates.map((state, index) => {
                          return (
                            <option value={stringifyStatus(state)} key={index}>
                              {stringifyStatus(state)}
                            </option>
                          );
                        })}
                        </select>
                        <i className="fa fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                  <div className="row padding-tb8">
                    <div className="col-lg-2 d-none d-xl-block"></div>
                    <div className="col-xl-5 col-lg-7 col-md-12">
                      <label>Mail</label>
                      <input
                        id="email"
                        type="email"
                        className="form-control custom-input"
                        disabled={!editUser}
                        placeholder="Correo electrónico"
                        aria-label="Correo electrónico"
                        required={true}
                      />
                      <label>Fecha de nacimiento</label>
                      <input
                        id="birthday"
                        type="date"
                        className="form-control custom-input"
                        disabled={!editUser}
                        placeholder="Fecha de nacimiento"
                        aria-label="Fecha de nacimiento"
                        required={true}
                      />
                      <label>Teléfono</label>
                      <input
                        id="phone"
                        type="text"
                        className="form-control custom-input"
                        disabled={!editUser}
                        placeholder="Teléfono"
                        aria-label="Teléfono"
                        required={true}
                      />
                      <label>Analista asignado</label>
                      <input
                        id="assignedAnalyst"
                        type="text"
                        className="form-control custom-input"
                        disabled={!editUser}
                        placeholder="Analista asignado"
                        aria-label="Analista asignado"
                        required={true}
                      />
                    </div>
                    <div className="col-xl-5 col-lg-5 d-none d-lg-block">
                      <div className="creditInfo">
                        <label>Card number</label>
                        <p>{viewUser ? viewUser.cardInfo.number : ""}</p>
                        <div className="row">
                          <div className="col-3">
                            <label>CVV</label>
                            <input
                              id="cvv"
                              type="number"
                              className="form-control custom-input small-input"
                              defaultValue={viewUser ? viewUser.cardInfo.cvv ?? "" : ""}
                              disabled={true}
                              ></input>
                          </div>
                          <div className="col-3">
                            <label>PIN</label>
                            <input
                              id="pin"
                              type="number"
                              className="form-control custom-input small-input"
                              defaultValue={viewUser ? viewUser.cardInfo.pin ?? "" : ""}
                              disabled={true}
                              ></input>
                          </div>
                          <div className="col-6">
                            <label>EXP</label>
                            <input
                              id="expiration"
                              type="text"
                              className="form-control custom-input small-input"
                              defaultValue={viewUser ? beautifyDate(viewUser.cardInfo.expiration) ?? "" : ""}
                              disabled={true}
                              ></input>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {editUser ? (
                    <button type="submit" className="btn">
                      <i className="fa-solid fa-user-check"></i> Guardar usuario
                    </button>
                  ) : (
                    <button className="btn">
                      <i className="fa-solid fa-pencil"></i> Editar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="addUserModal"
        tabindex="-1"
        aria-labelledby="addUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content grey-modal">
            <div className="padding-20">
              <form onSubmit={createUser}>
                <div className="modal-body">
                  <div className="row padding-tb8">
                    <button
                      type="button"
                      className="btn modal-close"
                      data-bs-dismiss="modal"
                      id="addUserModalClose"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-2 d-none d-xl-block">
                      <div className="modal-avatar">
                        <i className="fa-solid fa-user"></i>
                      </div>
                    </div>
                    <div className="col-8 col-md-9">
                      <div className="row">
                        <div className="col-5">
                          <input
                            id="name"
                            type="text"
                            className="form-control custom-input"
                            placeholder="Nombre(s)"
                            aria-label="First and middle name"
                            required={true}
                          />
                        </div>
                        <div className="col-7">
                          <input
                            id="lastname"
                            type="text"
                            className="form-control custom-input"
                            placeholder="Apellido(s)"
                            aria-label="Last name"
                            required={true}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-2 col-md-3 rightText">
                      <input type="hidden" id="status" value="" />
                      <a
                        href="/#"
                        className="btn setStatus dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Estatus
                      </a>
                      <ul className="dropdown-menu">
                        {originalUserStates.map((state, index) => {
                          return (
                            <li key={index}>
                              <a
                                href="/#"
                                className="dropdown-item"
                                onClick={() => addFilter(state)}
                              >
                                {state}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                  <div className="row padding-tb8">
                    <div className="col-2 d-none d-xl-block"></div>
                    <div className="col-lg-8 col-md-12">
                      <label>Mail</label>
                      <input
                        id="email"
                        type="email"
                        className="form-control custom-input"
                        placeholder="Correo electrónico"
                        aria-label="Correo electrónico"
                        required={true}
                      />
                      <label>Fecha de nacimiento</label>
                      <input
                        id="birthday"
                        type="date"
                        className="form-control custom-input"
                        placeholder="Fecha de nacimiento"
                        aria-label="Fecha de nacimiento"
                        required={true}
                      />
                      <label>Teléfono</label>
                      <input
                        id="phone"
                        type="text"
                        className="form-control custom-input"
                        placeholder="Teléfono"
                        aria-label="Teléfono"
                        required={true}
                      />
                      <label>Analista asignado</label>
                      <input
                        id="assignedAnalyst"
                        type="text"
                        className="form-control custom-input"
                        placeholder="Analista asignado"
                        aria-label="Analista asignado"
                        required={true}
                      />
                    </div>
                    <div className="col-lg-2 d-none d-xl-block"></div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">
                    <i className="fa-solid fa-user-plus"></i> Añadir usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
