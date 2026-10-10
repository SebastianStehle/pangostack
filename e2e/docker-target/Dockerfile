# An SSH server with its own Docker daemon, so deployments never see the containers of the e2e stack.
FROM docker:28-dind

RUN apk add --no-cache openssh \
 && ssh-keygen -A \
 && echo 'root:e2e-target' | chpasswd \
 && sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config \
 && sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
