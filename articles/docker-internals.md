# How Docker Actually Works

## Overview
When people talk about Docker, they often use the analogy of "lightweight virtual machines." While helpful for beginners, this is fundamentally incorrect. Docker doesn't use hypervisors or guest operating systems. Instead, it relies entirely on native Linux kernel features.

> [!WARNING]
> A Docker container is nothing more than a standard Linux process that has been isolated from the rest of the system using kernel features.

## Why it matters
Understanding Docker internals helps you debug complex production issues, write more secure `Dockerfile`s, and grasp how orchestrators like Kubernetes manage resources.

## How it works

Docker relies heavily on three core Linux kernel features:

### 1. Namespaces (Isolation)
Namespaces restrict what a process can *see*. When you start a container, Docker creates a set of namespaces for it:
- **PID Namespace**: The container gets its own isolated process tree. Inside the container, your app thinks it is `PID 1`.
- **NET Namespace**: The container gets its own isolated network stack, interfaces, and IP addresses.
- **MNT Namespace**: The container has its own isolated filesystem mount points.

### 2. Control Groups (cgroups) (Limits)
While Namespaces limit what a process can see, **cgroups** limit what a process can *use*.
cgroups ensure a container doesn't consume all the host's RAM or CPU. If a container exceeds its cgroup memory limit, the Linux kernel's OOM (Out Of Memory) killer will terminate it.

### 3. Union File Systems (UnionFS)
This is the magic behind Docker images. Instead of copying a full OS for every container, Docker uses layered filesystems. When you use a base image like `ubuntu:latest`, it's strictly read-only. When your container runs, Docker adds a thin, writable "container layer" on top.

```bash
# Example: Running a simple alpine container
docker run -it alpine sh

# Inside the container, the process thinks it owns the machine.
# But on the host, you can see it as a normal process!
ps aux | grep sh
```

## Best Practices
- **Use Alpine or Distroless images**: Smaller images mean faster deployments, lower storage costs, and a significantly smaller security attack surface.
- **Run as non-root**: By default, containers run as root. Always add a `USER` directive in your Dockerfile to run your app as an unprivileged user.
- **Leverage Build Cache**: Order your `Dockerfile` instructions from least-likely to change (e.g., OS dependencies) to most-likely to change (your source code).

## Common Mistakes
- ❌ Running multiple services (like a database and a web app) inside a single container. A container should have one concern.
- ❌ Storing state or databases inside the writable container layer. Containers are ephemeral. Always use Docker Volumes for persistent data.

## Further Reading
- [Docker Architecture Documentation](https://docs.docker.com/get-started/overview/)
- [Namespaces in Operation (LWN.net)](https://lwn.net/Articles/531114/)
