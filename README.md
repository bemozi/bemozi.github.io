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

Linux Mint XFCE is a lightweight, stable, and community-driven operating system that aligns perfectly with our open-source principles.

#### Step 1: Download & Create Live USB

1. Navigate to the [Linux Mint website](https://linuxmint.com/download.php) and choose the **XFCE Edition**. Select a fast download mirror and download the `.iso` file.
2. Download and install the open-source [Balena Etcher](https://etcher.balena.io) utility to flash the ISO file onto a USB drive (8 GB minimum).
3. **Flash the ISO:**
   * Open Etcher, click **"Flash from file"** and select the Linux Mint `.iso` file.
   * Click **"Select target"**, and choose your USB drive and click **"Flash!"**.
> [!CAUTION]
> **Verify the drive letter is correct:** selecting the wrong drive will permanently erase all data on that drive.

#### Step 2: Installation

1. Insert the Live USB and restart your computer. Press the relevant boot key (usually **F2, F10, F12, or Del**) to select the USB drive as the boot device.
2. Double-click **"Install Linux Mint"** on the desktop.
3. Choose your language and keyboard layout.
4. When prompted for **Installation Type,** choose the option: **"Install Linux Mint alongside [Your Current OS]"**.
5. **Allocate Space:** The installer will show a slider allowing you to define how much disk space is allocated to each operating system.
   * **Drag the divider** to allocate space. We recommend giving Linux Mint at least **50-100 GB** for system files and your application data.
   * Click **"Install Now."** 
6. Set your geographical location, choose a username, and set a **strong password**.
7. **Complete Installation:** Wait for the process to finish. When prompted, remove the USB drive and click **"Restart Now."**
8. Upon reboot, you will be presented with the **boot menu**, where you can choose to launch either **Linux Mint** or your **current OS**.

#### Step 3: Initial Security Update

After installation and reboot, update the system for the latest security patches:

1. Open the **Terminal** (press Ctrl+Alt+T).
2. Run the update commands:

	```bash
	sudo apt update && sudo apt upgrade -y && sudo apt install software-properties-common apt-transport-https ca-certificates curl -y
	```

3. Set up the Firewall: The **Uncomplicated Firewall (UFW)** is included but disabled. Enable it for robust security:

	```bash
	sudo ufw enable && sudo ufw default deny incoming
	```

### Browser Setup: Google Chrome (Required)

Our application has been extensively tested and optimized for **Google Chrome**. While other browsers may function, Chrome is the **required minimum environment** for guaranteed functionality.

There are two primary ways to install Google Chrome on Linux Mint:

#### Method A: Direct Download (Easiest)

1. Open the default Firefox browser.
2. Go to the official [Google Chrome Download Page](https://www.google.com/chrome).
3. Click **"Download Chrome"** and select the **`.deb`** package option.
4. Once the download is complete, open your Downloads folder and double-click the `.deb` file.
5. This will open the **Package Installer**. Click **"Install Package"** and enter your password when prompted.

#### Method B: Command Line (Advanced)

This method ensures Chrome is kept up-to-date with your system:

1. Open the **Terminal** (Ctrl+Alt+T).
2. Download the package key and add the Google repository:

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
