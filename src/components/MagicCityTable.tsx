import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Sheet from "@mui/joy/Sheet";
import Snackbar from "@mui/joy/Snackbar";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";
import { IconButton } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState, useEffect, ChangeEvent } from "react";
import { useAuthStore } from "../context/authContext";
import api from "../lib/api";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";

export interface MagicCityDTO {
  id: number;
  userId: number;
  name: string;
  area: number;
  population: number;
  established: Date;
  governor: string;
  capital: boolean;
  populationDensity: number;
}

export interface MagicCity {
  id: number;
  user: string;
  name: string;
  area: number;
  population: number;
  established: Date;
  governor: string;
  capital: boolean;
  populationDensity: number;
}

function useNewMagicCityModal() {
  const authStore = useAuthStore();
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [cityName, setCityName] = useState("");
  const [area, setArea] = useState("");
  const [population, setPopulation] = useState("");
  const [established, setEstablished] = useState("");
  const [governor, setGovernor] = useState("");
  const [capital, setCapital] = useState(false);
  const [density, setDensity] = useState("");

  const showModal = () => setOpen(true);
  const hideModal = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      await api.post(
        "/city/create",
        {
          name: cityName,
          area,
          population,
          established,
          governor,
          capital,
          populationDensity: density,
        },
        { headers: { Authorization: `Bearer ${authStore.getToken}` } }
      );
      setSnackbarError(false);
      setSnackbarMessage("Город добавлен");
    } catch {
      setSnackbarError(true);
      setSnackbarMessage("Ошибка при добавлении");
    } finally {
      setSnackbarOpen(true);
      hideModal();
    }
  };

  const modal = (
    <>
      <Modal open={open} onClose={hideModal}>
        <ModalDialog>
          <ModalClose />
          <Typography level="title-sm">Добавление города</Typography>
          <FormControl>
            <FormLabel>Название</FormLabel>
            <Input onChange={(e) => setCityName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Площадь</FormLabel>
            <Input onChange={(e) => setArea(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Население</FormLabel>
            <Input onChange={(e) => setPopulation(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Дата основания</FormLabel>
            <Input
              type="date"
              value={established}
              onChange={(ev: ChangeEvent) =>
                setEstablished((ev.target as HTMLInputElement).value)
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Губернатор</FormLabel>
            <Select
              value={governor}
              onChange={(_, v: unknown) => setGovernor(v as string)}
              placeholder="Выберите губернатора"
            >
              <Option value="HOBBIT">HOBBIT</Option>
              <Option value="ELF">ELF</Option>
              <Option value="GOLLUM">GOLLUM</Option>
            </Select>
          </FormControl>
          <FormControl
            sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
          >
            <FormLabel>Столица?</FormLabel>
            <Input
              type="checkbox"
              sx={{ width: "auto", height: "auto" }}
              onChange={(e) => setCapital(e.target.checked)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Плотность населения</FormLabel>
            <Input onChange={(e) => setDensity(e.target.value)} />
          </FormControl>
          <Button onClick={handleSubmit}>Создать</Button>
        </ModalDialog>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={3000}
        color={snackbarError ? "danger" : "success"}
      >
        <Typography>{snackbarMessage}</Typography>
      </Snackbar>
    </>
  );

  return [showModal, modal] as const;
}

function useEditMagicCityModal() {
  const authStore = useAuthStore();
  const [open, setOpen] = useState(false);
  const [cityId, setCityId] = useState<number | null>(null);
  const [cityName, setCityName] = useState("");
  const [area, setArea] = useState("");
  const [population, setPopulation] = useState("");
  const [established, setEstablished] = useState("");
  const [governor, setGovernor] = useState("");
  const [capital, setCapital] = useState(false);
  const [density, setDensity] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showEditModal = (
    id: number,
    n: string,
    a: number,
    p: number,
    e: Date,
    g: string,
    c: boolean,
    d: number
  ) => {
    setCityId(id);
    setCityName(n);
    setArea(`${a}`);
    setPopulation(`${p}`);
    setEstablished(e.toISOString().slice(0, 10));
    setGovernor(g);
    setCapital(c);
    setDensity(`${d}`);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (!cityId) return;
    try {
      await api.post(
        `/city/update-city/${cityId}`,
        {
          name: cityName,
          area,
          population,
          established,
          governor,
          capital,
          populationDensity: density,
        },
        { headers: { Authorization: `Bearer ${authStore.getToken}` } }
      );
      setSnackbarError(false);
      setSnackbarMessage("Город обновлен");
    } catch {
      setSnackbarError(true);
      setSnackbarMessage("Ошибка при обновлении");
    } finally {
      setSnackbarOpen(true);
      handleClose();
    }
  };

  const modal = (
    <>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="title-sm">Редактирование города</Typography>
          <FormControl>
            <FormLabel>ID</FormLabel>
            <Input value={cityId ?? "-"} disabled />
          </FormControl>
          <FormControl>
            <FormLabel>Название</FormLabel>
            <Input
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Площадь</FormLabel>
            <Input value={area} onChange={(e) => setArea(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Население</FormLabel>
            <Input
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Дата основания</FormLabel>
            <Input
              type="date"
              value={established}
              onChange={(ev: ChangeEvent) =>
                setEstablished((ev.target as HTMLInputElement).value)
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Губернатор</FormLabel>
            <Select
              value={governor}
              onChange={(_, v: unknown) => setGovernor(v as string)}
              placeholder="Выберите губернатора"
            >
              <Option value="HOBBIT">HOBBIT</Option>
              <Option value="ELF">ELF</Option>
              <Option value="GOLLUM">GOLLUM</Option>
            </Select>
          </FormControl>
          <FormControl
            sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
          >
            <FormLabel>Столица?</FormLabel>
            <Input
              type="checkbox"
              sx={{ width: "auto", height: "auto" }}
              onChange={(e) => setCapital(e.target.checked)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Плотность населения</FormLabel>
            <Input
              value={density}
              onChange={(e) => setDensity(e.target.value)}
            />
          </FormControl>
          <Button onClick={handleSubmit}>Сохранить</Button>
        </ModalDialog>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={3000}
        color={snackbarError ? "danger" : "success"}
      >
        <Typography>{snackbarMessage}</Typography>
      </Snackbar>
    </>
  );

  return [showEditModal, modal] as const;
}

const MagicCityTable = () => {
  const authStore = useAuthStore();
  const [search, setSearch] = useState("");
  const [cities, setCities] = useState<MagicCity[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [showNewModal, NewModal] = useNewMagicCityModal();
  const [showEditModal, EditModal] = useEditMagicCityModal();

  const edit = (city: MagicCity) => {
    showEditModal(
      city.id,
      city.name,
      city.area,
      city.population,
      city.established,
      city.governor,
      city.capital,
      city.populationDensity
    );
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/city/delete/${id}`, {
        headers: { Authorization: `Bearer ${authStore.getToken}` },
      });
      setSnackbarError(false);
      setSnackbarMessage("Город удален");
      setSnackbarOpen(true);
    } catch {
      setSnackbarError(true);
      setSnackbarMessage("Ошибка при удалении");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api.get("/city/all", {
          headers: { Authorization: `Bearer ${authStore.getToken}` },
        });
        const users = await Promise.all(
          response.data.map((it: MagicCityDTO) =>
            api.get(`/auth/username/${it.userId}`, {
              headers: { Authorization: `Bearer ${authStore.getToken}` },
            })
          )
        );
        const list: MagicCity[] = [];
        for (let i = 0; i < response.data.length; i++) {
          const dto: MagicCityDTO = response.data[i];
          list.push({
            id: dto.id,
            user: users[i].data,
            name: dto.name,
            area: dto.area,
            population: dto.population,
            established: new Date(dto.established),
            governor: dto.governor,
            capital: dto.capital,
            populationDensity: dto.populationDensity,
          });
        }
        setCities(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCities();
  }, [authStore.getToken]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/notifications");

    const fetchCities = async () => {
      try {
        const response = await api.get("/city/all", {
          headers: { Authorization: `Bearer ${authStore.getToken}` },
        });
        const users = await Promise.all(
          response.data.map((it: MagicCityDTO) =>
            api.get(`/auth/username/${it.userId}`, {
              headers: { Authorization: `Bearer ${authStore.getToken}` },
            })
          )
        );
        const list: MagicCity[] = [];
        for (let i = 0; i < response.data.length; i++) {
          const dto: MagicCityDTO = response.data[i];
          list.push({
            id: dto.id,
            user: users[i].data,
            name: dto.name,
            area: dto.area,
            population: dto.population,
            established: new Date(dto.established),
            governor: dto.governor,
            capital: dto.capital,
            populationDensity: dto.populationDensity,
          });
        }
        setCities(list);
      } catch (err) {
        console.error(err);
      }
    };

    socket.onmessage = () => {
      fetchCities();
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [authStore.getToken]);

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <FormLabel>Поиск по названию</FormLabel>
          <Input
            placeholder="Поиск"
            startDecorator={<SearchIcon />}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FormControl>
        <Button onClick={showNewModal}>Создать...</Button>
      </Box>

      <Sheet variant="outlined" sx={{ overflow: "auto", flex: 1 }}>
        <Table
          stickyHeader
          hoverRow
          sx={{
            "--TableCell-headBackground":
              "var(--joy-palette-background-level1)",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Пользователь</th>
              <th>Название</th>
              <th>Площадь</th>
              <th>Население</th>
              <th>Основан</th>
              <th>Губернатор</th>
              <th>Столица</th>
              <th>Плотность</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredCities.map((city) => (
              <tr key={city.id}>
                <td>{city.id}</td>
                <td>{city.user}</td>
                <td>{city.name}</td>
                <td>{city.area}</td>
                <td>{city.population}</td>
                <td>{city.established.toLocaleDateString()}</td>
                <td>{city.governor}</td>
                <td>{city.capital ? "Да" : "Нет"}</td>
                <td>{city.populationDensity}</td>
                <td>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      variant="soft"
                      color="success"
                      onClick={() => edit(city)}
                      disabled={
                        authStore.getRole !== "ROLE_ADMIN" &&
                        authStore.getUsername !== city.user
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="soft"
                      color="danger"
                      onClick={() => remove(city.id)}
                      disabled={
                        authStore.getRole !== "ROLE_ADMIN" &&
                        authStore.getUsername !== city.user
                      }
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
      {NewModal}
      {EditModal}
    </Box>
  );
};

export default MagicCityTable;
