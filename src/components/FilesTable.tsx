import { useState, useEffect } from "react";

import { useAuthStore } from "../context/authContext";
import api from "../lib/api";
import {
  Box,
  Button,
  IconButton,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Snackbar,
  Table,
  Typography,
  FormControl,
  FormLabel,
  Select,
} from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { IconButton as JoyIconButton } from "@mui/joy";
import Option from "@mui/joy/Option";

export interface FileStatsDTO {
  id: number,
  initiator: string,
  filename: string,
  additions: number,
  finished: boolean,
  timestamp: string
}

const BookCreatureTable = () => {
  const authStore = useAuthStore();
  const [fileStats, setFileStats] = useState<FileStatsDTO[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [files, setFiles] = useState<File[]>([])


  useEffect(() => {
    const fetchFileStats = async () => {
      try {
        const response = await api.get("/file/stats", {
          headers: { Authorization: `Bearer ${authStore.getToken}` },
        });

        console.log(response.data);
        setFileStats(response.data);
      } catch {
        console.error("Fetch file stats failed");
      }
    };

    fetchFileStats();
  }, [authStore.getToken]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/notifications");
    let timeoutId = 0;

    const fetchFileStats = async () => {
      try {
        const response = await api.get("/file/stats", {
          headers: { Authorization: `Bearer ${authStore.getToken}` },
        });

        console.log(response.data);
        setFileStats(response.data);
      } catch {
        console.error("Fetch creatures failed");
      }
    };

    socket.onmessage = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        fetchFileStats();
      }, 200)
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

      <Box sx={{ display: "flex", gap: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "15px" }}>
            <input
              style={{ marginTop: "5px", marginBottom: "5px" }}
              name="file"
              type="file"
              multiple
              onChange={(ev) => {
                console.log(ev)
                setFiles(Array.from(ev.target.files ?? []))
              }}
            />
            <Button style={{ width: "200px" }} type="submit" size="small" onClick={(ev) => {
              ev.preventDefault()

              if (files.length > 0) {
                const formData = new FormData();
                files.forEach((file) => {
                  formData.append("file", file);
                });
                api.post("/file/import", formData, {
                  headers: {
                    "Authorization": `Bearer ${authStore.getToken}` }
                });
                setSnackbarMessage("Файл отправлен на сервер")
                setSnackbarOpen(true)
                setFiles([])
              }
            }}>Загрузить</Button>
          </div>
        </FormControl>

      </Box>

      <Sheet variant="outlined" sx={{ overflow: "auto", flex: 1 }}>
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            "--TableCell-headBackground":
              "var(--joy-palette-background-level1)",
          }}
        >
          <thead>
            <tr>
              <th>Id</th>
              <th>Инициатор</th>
              <th>Имя файла</th>
              <th>Элементы</th>
              <th>Дата</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {fileStats.map((stat) => (
              <tr key={stat.id}>
                <td>{stat.id}</td>
                <td>{stat.initiator ?? "-"}</td>
                <td>{stat.filename ?? "-"}</td>
                <td>{stat.additions}</td>
                <td>{new Date(stat.timestamp).toLocaleDateString()}</td>
                <td>{stat.finished ? "Завершено" : "Ошибка"}</td>
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
        <JoyIconButton variant="outlined" color="neutral">
          1
        </JoyIconButton>
        <Button variant="outlined" endDecorator={<KeyboardArrowRightIcon />}>
          Следующая
        </Button>
      </Box>
    </Box>
  );
};

export default BookCreatureTable;
