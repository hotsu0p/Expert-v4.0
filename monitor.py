import customtkinter as ctk
from customtkinter import E, N, S
import tkinter as tk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import psutil
import sys
import os
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv('TOKEN')

# Retrieve command line arguments
""" if len(sys.argv) >=  3:
    # all are passed from ready.js
    userID = sys.argv[1]
    userTAG = sys.argv[2]
    userName = sys.argv[3]
    serverCount = sys.argv[4]
    channelCount = sys.argv[5]
    memberCount = sys.argv[6] 

    print(f"Received variables from JavaScript: {userID}, {userTAG}")
else:
    print("Insufficient command line arguments") """
import signal

# Send a SIGINT signal to the current process
def kill():
    os.kill(os.getpid(), signal.SIGINT)
# Window setup
window = ctk.CTk()
window.geometry("1500x1680")
window.title("System Usage Meter")
window.configure(background="gray")

# Set the dark background style for matplotlib
plt.style.use('dark_background')

# RAM usage functions
def get_ram_usage():
    total_ram = psutil.virtual_memory().total
    available_ram = psutil.virtual_memory().available
    usage_percentage = (total_ram - available_ram) / total_ram *  100
    return usage_percentage

# CPU usage functions
def get_cpu_usage():
    return psutil.cpu_percent(interval=1)

def test():
    window.destroy()

# Process usage functions
def get_process_usage(process_name):
    cpu_usage =  0
    memory_usage =  0

    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        if process_name in proc.info['name'] or (proc.info['cmdline'] and process_name in ' '.join(proc.info['cmdline'])):
            cpu_usage += proc.cpu_percent()
            memory_usage += proc.memory_info().rss

    return cpu_usage, memory_usage

# Update gauges function
def update_gauges():
    ram_usage = get_ram_usage()
    ram_label.configure(text=f"RAM Usage: {ram_usage:.2f}%")
    ram_data = [ram_usage] + ram_plot_data[:-1]
    ram_plot_data[:] = ram_data
    ram_ax.clear()
    ram_ax.plot(ram_plot_data)
    ram_canvas.draw()

    cpu_usage = get_cpu_usage()
    cpu_label.configure(text=f"CPU Usage: {cpu_usage:.2f}%")
    cpu_data = [cpu_usage] + cpu_plot_data[:-1]
    cpu_plot_data[:] = cpu_data
    cpu_ax.clear()
    cpu_ax.plot(cpu_plot_data)
    cpu_canvas.draw()

    vscode_cpu, vscode_memory = get_process_usage('code')
    node_cpu, node_memory = get_process_usage('node')

    vscode_cpu_label.configure(text=f"VS Code CPU Usage: {vscode_cpu:.2f}%")
    vscode_memory_label.configure(text=f"VS Code Memory Usage: {vscode_memory / (1024 *  1024):.2f} MB")
    node_cpu_label.configure(text=f"Node.js CPU Usage: {node_cpu:.2f}%")
    node_memory_label.configure(text=f"Node.js Memory Usage: {node_memory / (1024 *  1024):.2f} MB")

    window.after(5000, update_gauges)  # Update every  5 seconds (lower the vaule = more lag)

# RAM plot setup
ram_fig, ram_ax = plt.subplots()
ram_ax.set_facecolor("#1E1E1E")  # Set the background color
ram_ax.tick_params(axis='both', colors='white')  # Set tick colors
[spine.set_edgecolor('#FFFFFF') for spine in ram_ax.spines.values()]  # Set spines color

ram_canvas = FigureCanvasTkAgg(ram_fig, master=window)
ram_canvas.draw()
ram_canvas.get_tk_widget().pack(pady=10)
ram_plot_data = [0] *  100
ram_label = ctk.CTkLabel(window, text="RAM Usage:  0.00%")  # Create label without specifying colors
ram_label.pack()

# CPU plot setup
cpu_fig, cpu_ax = plt.subplots()
cpu_ax.set_facecolor("#1E1E1E")  # Set the background color
cpu_ax.tick_params(axis='both', colors='white')  # Set tick colors
[spine.set_edgecolor('#FFFFFF') for spine in cpu_ax.spines.values()]  # Set spines color

cpu_canvas = FigureCanvasTkAgg(cpu_fig, master=window)
cpu_canvas.draw()
cpu_canvas.get_tk_widget().pack(pady=10)
cpu_plot_data = [0] *  100
cpu_label = ctk.CTkLabel(window, text="CPU Usage:  0.00%")  # Create label without specifying colors
cpu_label.pack()

# Process labels
vscode_cpu_label = ctk.CTkLabel(window, text="VS Code CPU Usage:  0.00%")
vscode_memory_label = ctk.CTkLabel(window, text="VS Code Memory Usage:  0.00 MB")
node_cpu_label = ctk.CTkLabel(window, text="Node.js CPU Usage:  0.00%")
node_memory_label = ctk.CTkLabel(window, text="Node.js Memory Usage:  0.00 MB")

# Packing labels
vscode_cpu_label.pack()
vscode_memory_label.pack()
node_cpu_label.pack()
node_memory_label.pack()

# Button setup
""" button = ctk.CTkButton(master=window, text=userTAG, fg_color="white")
button.pack()
button2 = ctk.CTkButton(master=window, text="close window", command=test, fg_color="white", hover_color="red")
button2.pack()
userID = ctk.CTkButton(master=window, text=userID, fg_color="white")
userID.pack()
userTAG = ctk.CTkButton(master=window, text=userTAG, fg_color="white")
userTAG.pack()
serverCount = ctk.CTkButton(master=window, text=serverCount, fg_color="white")
serverCount.pack()
channelCount = ctk.CTkButton(master=window, text=channelCount, fg_color="white")
channelCount.pack() """
# Remaining widgets and initialization
update_gauges()
window.mainloop()
