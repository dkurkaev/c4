import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { SidebarLayout } from "./components/SidebarLayout";
import { Sidebar, SidebarHeader, SidebarBody, SidebarSection, SidebarItem, SidebarLabel } from "./components/Sidebar";
import { Page as DDPage } from "./domains/dd/Page";

// Иконка для Home
function HomeIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M9.493 2.852a.75.75 0 0 0-.986 0l-7 6.25a.75.75 0 1 0 .986 1.106L3 9.654V15a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.654l.507.554a.75.75 0 1 0 .986-1.106l-7-6.25ZM4.5 15V8.5h11V15h-11Z" clipRule="evenodd" />
    </svg>
  );
}

// Иконка для C2 - взаимодействие сервисов/компонентов
function C2Icon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0 1 14 3c0 .995-.182 1.948-.514 2.826-.204.54-.166 1.148.108 1.658.652 1.219 2.111 1.219 2.763 0a.988.988 0 0 1 .108-1.658C16.818 4.948 17 3.995 17 3a2 2 0 0 1 2.605 1.093c.256.081.395.339.395.607V8.25a1.25 1.25 0 1 1-2.5 0V5.24a.75.75 0 0 0-1.5 0v10.5a1.25 1.25 0 1 1-2.5 0V10.5a.75.75 0 0 0-1.5 0v5.25a1.25 1.25 0 1 1-2.5 0V8.25Z" />
    </svg>
  );
}

// Иконка для DD - серверы/деплоймент
function DDIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Zm0 4.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.8a2 2 0 0 1-1.99-1.79L2 7.5ZM10 9a.75.75 0 0 1 .75.75v2.546l.943-1.048a.75.75 0 1 1 1.114 1.004l-2.25 2.5a.75.75 0 0 1-1.114 0l-2.25-2.5a.75.75 0 1 1 1.114-1.004l.943 1.048V9.75A.75.75 0 0 1 10 9Z" clipRule="evenodd" />
    </svg>
  );
}

// Компоненты страниц
function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать в систему-репозиторий архитектуры C4</h1>
      <p className="text-lg text-gray-600">
        Выберите раздел в левой панели для работы с архитектурными диаграммами.
      </p>
    </div>
  );
}

function C2Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">C2 - Container Diagrams</h1>
      <p className="text-lg text-gray-600">
        Здесь будут диаграммы контейнеров уровня C2 - архитектура взаимодействия сервисов.
      </p>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();

  const sidebar = (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-semibold text-gray-900">C4 Architecture</h2>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current={location.pathname === "/"}>
            <HomeIcon />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/c2" current={location.pathname === "/c2"}>
            <C2Icon />
            <SidebarLabel>C2</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/dd" current={location.pathname === "/dd"}>
            <DDIcon />
            <SidebarLabel>DD</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  );

  return (
    <SidebarLayout sidebar={sidebar}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/c2" element={<C2Page />} />
        <Route path="/dd" element={<DDPage />} />
      </Routes>
    </SidebarLayout>
  );
}

function App() {
  return <AppLayout />;
}

export default App;