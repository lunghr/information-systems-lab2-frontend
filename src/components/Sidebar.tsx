import GlobalStyles from "@mui/joy/GlobalStyles";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import IconButton from "@mui/joy/IconButton";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import FileIcon from "@mui/icons-material/FilePresent";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SettingsIcon from "@mui/icons-material/Settings";

import ColorSchemeToggle from "./ColorSchemeToggle";
import { closeSidebar } from "../lib/sidebar";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "../context/authContext";
import { GitHub } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

// Vite base URL
const basePath = import.meta.env.BASE_URL;

const Toggler = ({
  defaultExpanded = false,
  renderToggle,
  children,
}: {
  defaultExpanded?: boolean;
  children: React.ReactNode;
  renderToggle: (params: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultExpanded);
  return (
    <>
      {renderToggle({ open, setOpen })}
      <Box
        sx={[
          {
            display: "grid",
            transition: "0.2s ease",
            "& > *": {
              overflow: "hidden",
            },
          },
          open ? { gridTemplateRows: "1fr" } : { gridTemplateRows: "0fr" },
        ]}
      >
        {children}
      </Box>
    </>
  );
};

const Sidebar = observer(() => {
  const authStore = useAuthStore();
  const location = useLocation();

  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: 'fixed', md: 'sticky' },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          md: "none",
        },
        transition: "transform 0.4s, width 0.4s",
        zIndex: 10000,
        height: "100dvh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            "--Sidebar-width": "220px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "240px",
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: "fixed",
          zIndex: 9998,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: "var(--SideNavigation-slideIn)",
          backgroundColor: "var(--joy-palette-background-backdrop)",
          transition: "opacity 0.4s",
          transform: {
            xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            lg: "translateX(-100%)",
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <img
          src={`${basePath}/cat.ico`}
          alt="Joy UI"
          width={32}
          height={32}
          style={{ borderRadius: "6px" }}
        />
        <Typography level="title-lg">ИС Лаб #1</Typography>
        <ColorSchemeToggle sx={{ ml: "auto" }} />
      </Box>
      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
          }}
        >
          <Link to="/">
            <ListItem>
              <ListItemButton selected={location.pathname === "/"}>
                <HomeRoundedIcon />
                <ListItemContent>
                  <Typography level="title-sm">Главная</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </Link>

          <Link to="/files">
            <ListItem>
              <ListItemButton selected={location.pathname === "/files"}>
                <FileIcon />
                <ListItemContent>
                  <Typography level="title-sm">Файлы</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </Link>

          <Link to="/profile">
            <ListItem>
              <ListItemButton selected={location.pathname === "/profile"}>
                <AccountCircleIcon />
                <ListItemContent>
                  <Typography level="title-sm">Профиль</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </Link>

          {authStore.getRole === "ROLE_ADMIN" && (
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <SettingsIcon />
                    <ListItemContent>
                      <Typography level="title-sm">Управление</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[
                        open
                          ? {
                              transform: "rotate(180deg)",
                            }
                          : {
                              transform: "none",
                            },
                      ]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ mt: 0.5, gap: 0.5 }}>
                  <Link to="/admin/users">
                    <ListItem>
                      <ListItemButton
                        selected={location.pathname === "/admin/users"}
                      >
                        Список пользователей
                      </ListItemButton>
                    </ListItem>
                  </Link>
                  <Link to="/admin/requests">
                    <ListItem>
                      <ListItemButton
                        selected={location.pathname === "/admin/requests"}
                      >
                        Заявки
                      </ListItemButton>
                    </ListItem>
                  </Link>
                </List>
              </Toggler>
            </ListItem>
          )}
        </List>

        <List
          size="sm"
          sx={{
            mt: "auto",
            flexGrow: 0,
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
            "--List-gap": "8px",
            mb: 2,
          }}
        >
          <Link to="https://github.com/lunghr/information-systems-lab2-frontend">
            <ListItem>
              <ListItemButton>
                <GitHub />
                Фронтенд
              </ListItemButton>
            </ListItem>
          </Link>
          <Link to="https://github.com/lunghr/information-systems-lab2-backend">
            <ListItem>
              <ListItemButton>
                <GitHub />
                Бэкенд
              </ListItemButton>
            </ListItem>
          </Link>
        </List>
      </Box>
      <Divider />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm">{authStore.getUsername}</Typography>
          <Typography level="body-xs">
            {
              {
                ROLE_USER: "Пользователь",
                ROLE_ADMIN: "Админинстратор",
                null: "Ошибка",
              }[authStore.getRole ?? "null"]
            }
          </Typography>
        </Box>
        <IconButton
          size="sm"
          variant="plain"
          color="neutral"
          onClick={() => authStore.logout()}
        >
          <LogoutRoundedIcon />
        </IconButton>
      </Box>
    </Sheet>
  );
});

export default Sidebar;
