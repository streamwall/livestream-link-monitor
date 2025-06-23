# StreamSource Configuration Update

To allow the livestream monitor to connect to StreamSource, you need to update the Rails configuration to allow requests from `host.docker.internal`.

## Option 1: Update development.rb (Recommended for development)

Add this line to `config/environments/development.rb` in your StreamSource project:

```ruby
Rails.application.configure do
  # ... existing configuration ...
  
  # Allow requests from Docker containers
  config.hosts << "host.docker.internal"
  
  # ... rest of configuration ...
end
```

## Option 2: Update via environment variable

Alternatively, you can set an environment variable when running StreamSource:

```bash
RAILS_DEVELOPMENT_HOSTS=host.docker.internal docker-compose up
```

Or add it to StreamSource's docker-compose.yml:

```yaml
services:
  web:
    environment:
      - RAILS_DEVELOPMENT_HOSTS=host.docker.internal
```

## Option 3: Allow all hosts in development (less secure)

If you're only running this locally for development, you can disable host checking entirely:

```ruby
Rails.application.configure do
  # ... existing configuration ...
  
  # Allow requests from any host (development only!)
  config.hosts.clear
  
  # ... rest of configuration ...
end
```

After making this change, restart your StreamSource Rails application.

## Testing the Connection

Once you've updated StreamSource, you can test the connection from the livestream monitor:

1. From outside Docker (using localhost):
   ```bash
   # Update .env to use localhost
   STREAMSOURCE_API_URL=http://localhost:3000
   
   # Test the connection
   node test-streamsource.js
   ```

2. From inside Docker (using host.docker.internal):
   ```bash
   # Update .env to use host.docker.internal
   STREAMSOURCE_API_URL=http://host.docker.internal:3000
   
   # Run in Docker
   docker-compose up
   ```