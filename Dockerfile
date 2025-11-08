FROM wiremock/wiremock:3.13.1

# Copy predefined stubs and response bodies
COPY wiremock/mappings /home/wiremock/mappings
COPY wiremock/__files /home/wiremock/__files

# Allow Render/Railway to detect the listening port
EXPOSE 8080

# WireMock already has the correct entrypoint, so no CMD override
