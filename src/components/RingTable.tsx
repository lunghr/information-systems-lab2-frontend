import Box from "@mui/joy/Box";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import { useAuthStore } from "../context/authContext";
import api from "../lib/api";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Button from "@mui/joy/Button";
import Snackbar from "@mui/joy/Snackbar";
import { IconButton, Typography } from "@mui/joy";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function useNewRingModal(): [() => void, JSX.Element] {
  const authStore = useAuthStore();
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [ringName, setRingName] = useState("");
  const [ringWeight, setRingWeight] = useState("");

  const showModal = () => setOpen(true);
  const hideModal = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      await api.post(
        "/ring/create",
        { name: ringName, weight: ringWeight },
        { headers: { Authorization: `Bearer ${authStore.getToken}` } }
      );
      setSnackbarError(false);
      setSnackbarMessage("Кольцо добавлено");
    } catch {
      setSnackbarError(true);
      setSnackbarMessage("Ошибка при добавлении кольца");
    } finally {
      setSnackbarOpen(true);
      hideModal();
    }
  };

  const modalContent = (
    <>
      <Modal open={open} onClose={hideModal}>
        <ModalDialog>
          <ModalClose />
          <h2>Добавление кольца</h2>

          <Input
            placeholder="Имя"
            onChange={(e) => {
              setRingName(e.target.value);
            }}
          />
          <Input
            placeholder="Вес"
            onChange={(e) => {
              setRingWeight(e.target.value);
            }}
          />
          <Button onClick={handleSubmit}>Создать</Button>
        </ModalDialog>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        color={snackbarError ? "danger" : "success"}
        onClose={() => setSnackbarOpen(false)}
      >
        <Typography>{snackbarMessage}</Typography>
      </Snackbar>
    </>
  );

  return [showModal, modalContent];
}

function useEditRingModal() {
  const authStore = useAuthStore();
  const [open, setOpen] = useState(false);
  const [ringId, setRingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showEditModal = (
    id: number,
    currentName: string,
    currentWeight: number
  ) => {
    setRingId(id);
    setName(currentName);
    setWeight(`${currentWeight}`);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (!ringId) return;
    try {
      await api.post(
        `/ring/update/${ringId}`,
        { name, weight },
        { headers: { Authorization: `Bearer ${authStore.getToken}` } }
      );
      setSnackbarError(false);
      setSnackbarMessage("Данные кольца обновлены");
    } catch {
      setSnackbarError(true);
      setSnackbarMessage("Ошибка при обновлении данных кольца");
    } finally {
      setSnackbarOpen(true);
      handleClose();
    }
  };

  const EditRingModal = (
    <>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="title-sm">Редактирование кольца</Typography>
          <FormControl>
            <FormLabel>ID</FormLabel>
            <Input value={ringId ?? "-"} disabled />
          </FormControl>
          <FormControl>
            <FormLabel>Имя</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Вес</FormLabel>
            <Input value={weight} onChange={(e) => setWeight(e.target.value)} />
          </FormControl>
          <Button onClick={handleSubmit}>Сохранить</Button>
        </ModalDialog>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        color={snackbarError ? "danger" : "success"}
        onClose={() => setSnackbarOpen(false)}
      >
        <Typography>{snackbarMessage}</Typography>
      </Snackbar>
    </>
  );

  return [showEditModal, EditRingModal] as const;
}

export interface RingDTO {
  id: number;
  userId: number;
  name: string;
  weight: number;
}

export interface Ring {
  id: number;
  owner: string;
  name: string;
  weight: number;
}

const RingsTable = () => {
  const authStore = useAuthStore();
  const [search, setSearch] = useState<string>("");
  const [rings, setRings] = useState<Array<Ring>>([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [showNewRingModal, NewRingModal] = useNewRingModal();
  const [showEditModal, EditRingModal] = useEditRingModal();

  const edit = async (id: number, name: string, weight: number) => {
    showEditModal(id, name, weight);
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/ring/delete/${id}`, {
        headers: { Authorization: `Bearer ${authStore.getToken}` },
      });

      setSnackbarError(false);
      setSnackbarMessage("Кольцо удалено");
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      setSnackbarError(true);
      setSnackbarMessage("Ошибка при удалении кольца");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const fetchRings = async () => {
      try {
        const response = await api.get("/ring/all", {
          headers: { Authorization: `Bearer ${authStore.getToken}` },
        });

        const users = await Promise.all(
          response.data
            .map((it: RingDTO) => it.userId)
            .map((it: number) =>
              api.get(`/auth/username/${it}`, {
                headers: { Authorization: `Bearer ${authStore.getToken}` },
              })
            )
        );

        const rings: Array<Ring> = [];

        for (let i = 0; i < response.data.length; i++) {
          rings.push({
            id: response.data[i].id,
            owner: users[i].data,
            name: response.data[i].name,
            weight: response.data[i].weight,
          });
        }

        setRings(rings);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRings();
  }, [authStore.getToken]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/notifications");

    const fetchRings = async () => {
      try {
        const response = await api.get("/ring/all", {
          headers: { Authorization: `Bearer ${authStore.getToken}` },
        });

        const users = await Promise.all(
          response.data
            .map((it: RingDTO) => it.userId)
            .map((it: number) =>
              api.get(`/auth/username/${it}`, {
                headers: { Authorization: `Bearer ${authStore.getToken}` },
              })
            )
        );

        const rings: Array<Ring> = [];

        for (let i = 0; i < response.data.length; i++) {
          rings.push({
            id: response.data[i].id,
            owner: users[i].data,
            name: response.data[i].name,
            weight: response.data[i].weight,
          });
        }

        setRings(rings);
      } catch (error) {
        console.error(error);
      }
    };

    socket.onmessage = () => {
      fetchRings();
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [authStore.getToken]);

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100dvh",
      }}
    >
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={3000}
        color={snackbarError ? "danger" : "success"}
      >
        <Typography>{snackbarMessage}</Typography>
      </Snackbar>

      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Поиск по имени</FormLabel>
          <Input
            placeholder="Поиск"
            startDecorator={<SearchIcon />}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FormControl>
        <Button onClick={showNewRingModal}> Создать... </Button>
      </Box>
      <Sheet variant="outlined" sx={{ overflow: "auto", flex: 1 }}>
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            "--TableCell-headBackground":
              "var(--joy-palette-background-level1)",
            "--Table-headerUnderlineThickness": "1px",
            "--TableRow-hoverBackground":
              "var(--joy-palette-background-level1)",
            "--TableCell-paddingY": "4px",
            "--TableCell-paddingX": "8px",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Владелец</th>
              <th>Название</th>
              <th>Вес</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {rings
              .filter((ring) => ring.name.includes(search))
              .map((ring) => (
                <tr key={ring.id}>
                  <td>{ring.id}</td>
                  <td>{ring.owner}</td>
                  <td>{ring.name ? ring.name : "-"}</td>
                  <td>{ring.weight}</td>
                  <td>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="sm"
                        variant="soft"
                        color="success"
                        disabled={
                          authStore.getRole !== "ROLE_ADMIN" &&
                          authStore.getUsername !== ring.owner
                        }
                        onClick={() => edit(ring.id, ring.name, ring.weight)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="soft"
                        color="danger"
                        disabled={
                          authStore.getRole !== "ROLE_ADMIN" &&
                          authStore.getUsername !== ring.owner
                        }
                        onClick={() => remove(ring.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Sheet>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button variant="outlined" startDecorator={<KeyboardArrowLeftIcon />}>
          Предыдущая
        </Button>
        <IconButton variant="outlined" color="neutral">
          1
        </IconButton>
        <Button variant="outlined" endDecorator={<KeyboardArrowRightIcon />}>
          Следующая
        </Button>
      </Box>
      {NewRingModal}
      {EditRingModal}
    </Box>
  );
};

export default RingsTable;
