#!/bin/sh
set -e

/usr/sbin/sshd

# Only listen on the socket, the daemon is never used from outside of this container. Every deployment
# creates its own network, so small subnets are used to not run out of addresses after about 30 deployments.
exec dockerd-entrypoint.sh dockerd \
  --host=unix:///var/run/docker.sock \
  --default-address-pool base=10.200.0.0/16,size=24
