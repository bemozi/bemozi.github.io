<p align="center">
	<a href="https://bemozi.github.io">
		<picture>
			<source srcset="https://github.com/bemozi/bemozi.github.io/raw/refs/heads/main/assets/logo-white.svg" media="(prefers-color-scheme: dark)">
			<img src="https://github.com/bemozi/bemozi.github.io/raw/refs/heads/main/assets/logo.svg" alt="Statim" width="150">
		</picture>
	</a><br><br>
	An Open Source Local-First Web App <b>for Reliable Office Collaboration</b>
</p>

## Introducing Statim

[Statim](https://bemozi.github.io) is a **fully auditable web app** that offers sustained functionality without internet connectivity and **complete data ownership**, all with a responsive, intuitive, and **distraction-free interface**.

> [!NOTE]
> **Statim** is built only with native, well-documented, and officially supported browser APIs and **does not rely on any third-party dependencies**.

## Data Collection & Privacy

Operational logs and session **data are generated and stored only on your local device** and **never transmitted** to us or any third party, as it's technically impossible due to our architecture.

> [!NOTE]
> We use no cookies, web beacons or tracking scripts.

## Recommended Environment for Maximum Performance (Developer's Choice)

For optimal performance, stability, and enhanced security, we highly recommend using Linux Mint XFCE (for its low resource use). You are, however, free to use other operating systems.

### System Setup: Linux Mint XFCE (Optional/Recommended)

#### Step 1: Download & Create Live USB

1. Download the **XFCE Edition** `.iso` file from the [Linux Mint download page](https://linuxmint.com/download.php).
2. Download and install [Balena Etcher](https://etcher.balena.io) to flash the ISO file onto a USB drive (8 GB minimum).
3. Open Etcher. First, click `Flash from file` to select the `.iso` file. Next, click `Select drive` to choose your USB, and finally, click `Flash!`.

> [!CAUTION]
> Verify the drive letter is correct to avoid permanent data loss.

#### Step 2: Install Linux Mint Alongside Your Current OS (Dual Boot)

This installation **preserves both operating systems**. Use the boot menu at startup to select Linux Mint if you don't need software that only runs on Windows.

1. Insert the USB, restart your computer, and repeatedly press the boot key (usually `F2`, `F10`, `F12`, or `Del`) to select the USB drive as the boot device.
2. Run `Install Linux Mint` from the desktop, and choose your language and keyboard layout.
3. On the **Installation Type** screen, select `Install Linux Mint alongside your current OS`.
4. To allocate disk space, drag the slider (30 GB minimum), then, click `Install Now`.
5. Set location, username, and create a **strong password**.
6. After installation, **remove the USB** and click `Restart Now`.

#### Step 3: Initial Security Update

After installation and restart, update the system for security patches:

1. To update, open the **Terminal** (press `Ctrl`+`Alt`+`T`), copy and paste the following command, then press Enter:

	```bash
	sudo apt update && sudo apt upgrade -y
	```

2. The Uncomplicated Firewall (UFW) is pre-installed but disabled. Enable it for robust security:

	```bash
	sudo ufw enable && sudo ufw default deny incoming
	```

### Browser Setup: Google Chrome (Required)

**Statim** has been extensively tested and optimized for Google Chrome. While other browsers *might* work, Chrome is the **required minimum environment** for guaranteed functionality.

> [!NOTE]
> These instructions are for users who have followed the previous Linux Mint installation steps.

#### Method A: Direct Download (Easiest)

1. Download the official [Google Chrome `.deb` package](https://www.google.com/chrome).
2. Open the `.deb` file, click `Install Package` and enter your password.

#### Method B: Command Line (Automatic Updates)

This method ensures Chrome updates automatically with your system:

1. Download the package key and add the Google repository:

	```bash
	wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg
	echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
	```

2. Update the system's package list and install Chrome:

	```bash
	sudo apt update && sudo apt install google-chrome-stable
	```

## Development Status & Warranty

The current version is under active development and may contain bugs, security vulnerabilities or unexpected behavior. It is provided **"as-is"** without any warranty, express or implied. (See the [LICENSE](https://github.com/bemozi/bemozi.github.io/tree/main?tab=License-1-ov-file) file for full details).

## Data Safety & Liability

We do not provide data recovery services. As files are stored locally, the processes of data retention, security, backup, and deletion remain the user's sole responsibility.

> [!WARNING]
> Backups are mandatory for sensitive data.

In no event shall the authors or copyright holders be liable for any damages (including, but not limited to, direct, indirect, incidental, special, or consequential damages) arising out of the use or inability to use **Statim**.

> [!CAUTION]
> By using **Statim**, you agree to indemnify and hold harmless the developers, authors, and copyright holders from and against any and all claims, damages, liabilities, costs, and expenses, including, but not limited to, attorney's fees, arising out of or in connection with your use or distribution of **Statim**.
## Legal Information

**Statim** is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](https://github.com/bemozi/bemozi.github.io/tree/main?tab=License-1-ov-file).

The AGPL-3.0 copyleft clause requires that any Derivative work of **Statim** deployed as a network service must release its corresponding source code under the AGPL-3.0.

By using **Statim**, you agree to abide by all local laws.

By submitting any contribution to **Statim** (including code, documentation, or suggestions), you represent and warrant that you have the legal right to grant the license and that the contribution is your original work or you have the necessary permissions to submit it, and you grant **Statim** a perpetual, irrevocable, and royalty-free license to use, reproduce, modify, and distribute the contribution under the AGPL-3.0 terms.

**Statim** retains the right to modify and release future versions of the project, including its source code and features, under the AGPL-3.0 terms, at any time without prior notice.

## Contributing & Support

Help us make **Statim** more effective for the Local-First community and its users.

* If unexpected behavior or issues occur, [create a bug report](https://github.com/bemozi/bemozi.github.io/issues/new/choose).
* For suggestions or improvements, [submit a feature request](https://github.com/bemozi/bemozi.github.io/pulls).
* Regarding feedback or general questions, [join GitHub discussions](https://github.com/bemozi/bemozi.github.io/discussions).

Expand **Statim**'s reach by promoting it.

> [!TIP]
> Star this repository to track new features and improvements.
