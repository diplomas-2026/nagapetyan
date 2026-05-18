const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, '..', 'artifacts', 'screenshots');

const users = {
  admin: { login: 'admin', password: 'admin123' },
  owner: { login: 'owner1', password: 'owner123' },
  employee: { login: 'employee1', password: 'employee123' },
};

async function cleanScreenshots() {
  fs.mkdirSync(screenshotsDir, { recursive: true });
  for (const file of fs.readdirSync(screenshotsDir)) {
    if (file.endsWith('.png')) {
      fs.unlinkSync(path.join(screenshotsDir, file));
    }
  }
}

async function screenshot(page, name) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(900);
  await page.screenshot({
    path: path.join(screenshotsDir, name),
    fullPage: true,
  });
}

async function resetSession(page) {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
}

async function loginAs(page, user) {
  await resetSession(page);
  await page.goto('/login');
  await page.getByLabel('Логин').fill(user.login);
  await page.getByLabel('Пароль').fill(user.password);
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.waitForURL(/\/organizations(\/\d+)?/);
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function open(page, url, expectedText) {
  await page.goto(url);
  if (expectedText) {
    await expect(page.getByText(expectedText).first()).toBeVisible();
  }
  await page.waitForLoadState('networkidle').catch(() => {});
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  await cleanScreenshots();
});

test('capture public login screen', async ({ page }) => {
  await resetSession(page);
  await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible();
  await screenshot(page, '01-login.png');
});

test('capture admin screens', async ({ page }) => {
  await loginAs(page, users.admin);

  await open(page, '/organizations', 'Организации');
  await screenshot(page, '02-admin-organizations-list.png');

  await open(page, '/organizations/new', 'Новая организация');
  await screenshot(page, '03-admin-organization-create.png');

  await page.getByLabel('Дать доступ существующему владельцу').check();
  await screenshot(page, '04-admin-organization-owner-select.png');

  await open(page, '/organizations/1', 'Просмотр данных организации');
  await screenshot(page, '05-organization-overview.png');

  await open(page, '/organizations/1?tab=graph', 'Карта маршрутов');
  await screenshot(page, '06-organization-routes.png');

  await open(page, '/organizations/1?tab=analytics', 'Аналитика');
  await screenshot(page, '07-organization-analytics.png');

  await open(page, '/organizations/1?tab=members', 'Поиск по сотрудникам');
  await screenshot(page, '08-organization-members.png');

  await open(page, '/organizations/1?tab=reports', 'Поиск по отправлениям');
  await screenshot(page, '09-organization-shipments.png');

  await open(page, '/organizations/1/members/1', 'Сотрудник организации');
  await screenshot(page, '10-member-details.png');

  await open(page, '/organizations/1/members/new?role=EMPLOYEE', 'Новый сотрудник');
  await screenshot(page, '11-member-create.png');

  await open(page, '/organizations/1/reports/1', 'Карточка отправления');
  await screenshot(page, '12-shipment-details.png');

  await open(page, '/organizations/1/reports/1/edit', 'Редактирование отправления');
  await screenshot(page, '13-shipment-edit.png');

  await open(page, '/organizations/1/reports/new', 'Новое отправление');
  await screenshot(page, '14-shipment-create.png');

  await open(page, '/organizations/1/reports/1/movements/new', 'Новый этап передвижения');
  await screenshot(page, '15-movement-create.png');

  await open(page, '/organizations/1/reports/import', 'Загрузить отчет');
  await screenshot(page, '16-import-report.png');

  await open(page, '/organizations/1/points?kind=from&name=Москва&lat=55.755826&lng=37.6173', 'Москва');
  await screenshot(page, '17-point-analytics.png');
});

test('capture owner screens', async ({ page }) => {
  await loginAs(page, users.owner);
  await open(page, '/organizations/1?tab=history', 'История действий');
  await screenshot(page, '18-owner-action-history.png');
});

test('capture employee read-only screens', async ({ page }) => {
  await loginAs(page, users.employee);
  await open(page, '/organizations/1', 'Просмотр данных организации');
  await screenshot(page, '19-employee-overview-readonly.png');

  await open(page, '/organizations/1/reports/1', 'Карточка отправления');
  await screenshot(page, '20-employee-shipment-readonly.png');
});
