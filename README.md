<p align="center">
	<a align="center" href="https://bemozi.github.io">
		<picture>
			<source srcset="https://github.com/bemozi/bemozi.github.io/raw/refs/heads/main/logo-white.svg" media="(prefers-color-scheme: dark)">
			<img src="https://github.com/bemozi/bemozi.github.io/raw/refs/heads/main/logo.svg" alt="Statim" width="150">
		</picture>
	</a><br><br>
	An Open Source Local-First Web App <b>for Reliable Office Collaboration</b>
</p>

## Introducing Statim

[Statim](https://bemozi.github.io) is a **fully auditable web app** that offers sustained functionality without connectivity and **complete data ownership**, all with a responsive, intuitive, and **distraction-free interface**.

Expand the reach of [Statim](https://bemozi.github.io)'s vision by promoting its Web App.

> [!NOTE]
> This repository only uses native, well-documented, and officially supported browser APIs without relying on any third-party dependencies.

## Recommended Environment (Optimal Performance & Privacy)

We strongly recommend using **Linux Mint XFCE** and **Google Chrome** to ensure **optimal performance**, **stability**, and **enhanced security**.

### System Setup: Linux Mint XFCE

**Linux Mint XFCE** is a lightweight, stable, and secure operating system.

#### Step 1: Download & Create Live USB

1. Go to the [Linux Mint download page](https://linuxmint.com/download.php), select the **XFCE Edition**, and download the `.iso` file via a fast mirror.
2. Download and install the [Balena Etcher](https://etcher.balena.io) utility to flash the ISO file onto a USB drive (8 GB minimum).
3. Open Etcher, click **Flash from file** to select the `.iso` file, then, click **Select drive** to choose your USB drive and click **Flash!**.
> [!CAUTION]
> **Verify the drive letter is correct:** selecting the wrong drive will permanently erase all data on that drive.

#### Step 2: Installation

1. Insert the Live USB, restart your computer and repeatedly press the boot key (usually **F2, F10, F12, or Del**) to select the USB drive as the boot device.
2. Double-click **Install Linux Mint** on the desktop, and choose your language and keyboard layout.
3. On **Installation Type** screen, select the option: **Install Linux Mint alongside [Your Current OS]**.
4. **Allocate Disk Space:** drag the slider to allocate space for Linux Mint, ideally **50-100 GB** or more. Then, Click **Install Now**.
5. Set your geographical location, preferred username, and create a **strong password**.
6. After the installation completes, **remove the Live USB** and click **Restart Now**.
7. Upon reboot, the **boot menu** will allow you to choose to launch either **Linux Mint** or your **current OS**.

#### Step 3: Initial Security Update

After installation and reboot, update the system for the latest security patches:

1. Open the **Terminal** (press Ctrl+Alt+T) to run the necessary update commands:

	```bash
	sudo apt update && sudo apt upgrade -y && sudo apt install software-properties-common apt-transport-https ca-certificates curl -y
	```

2. The **Uncomplicated Firewall (UFW)** is pre-installed but disabled. Enable it for robust security:

	```bash
	sudo ufw enable && sudo ufw default deny incoming
	```

### Browser Setup: Google Chrome (Required)

Our application has been extensively tested and optimized for **Google Chrome**. While other browsers may function, Chrome is the **required minimum environment** for guaranteed functionality.

#### Method A: Direct Download (Easiest)

1. Go to the official [Google Chrome Download Page](https://www.google.com/chrome), click **Download Chrome** and select the **`.deb`** package option.
2. Once downloaded, open the `.deb` file. In the **Package Installer**, click **Install Package** and enter your password.

#### Method B: Command Line (Advanced)

This method ensures Chrome is kept up-to-date with your system:

1. Open the **Terminal** (press Ctrl+Alt+T) to download the package key and add the Google repository:

	```bash
	wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg
	echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
	```

3. Update the system's package list and install Chrome:

	```bash
	sudo apt update && sudo apt install google-chrome-stable
	```

## Development Status & Data Safety

The current version is under active development and may contain bugs or unexpected behavior; therefore, it is provided **"as-is"** without any warranty, express or implied. (see the [LICENSE](https://github.com/bemozi/bemozi.github.io/tree/main?tab=License-1-ov-file) file for full details).

> [!WARNING]
> **Data backups are mandatory** when handling sensitive information.

## Contributing & Support

Help us make **Statim** more effective for the **Local-First community**.

* If **unexpected behavior or issues** occur, [create a bug report](https://github.com/bemozi/bemozi.github.io/issues/new/choose).
* For **suggestions or improvements**, [submit a feature request](https://github.com/bemozi/bemozi.github.io/pulls).
* Regarding **feedback or general questions**, [join GitHub discussions](https://github.com/bemozi/bemozi.github.io/discussions).

> [!TIP]
> Star this repository to track new features and improvements.

## License

This repository is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](https://github.com/bemozi/bemozi.github.io/tree/main?tab=License-1-ov-file).
