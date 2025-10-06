# Imagens do Painel de Sorvetes

## Como adicionar imagens:

1. **Coloque suas imagens** nesta pasta (`src/assets/images/`)
2. **Edite o arquivo** `src/app/services/static-images.service.ts`
3. **Adicione as imagens** no array `images`

## Exemplo:

```typescript
{
  id: '1',
  name: 'Sorvete de Chocolate',
  url: '/assets/images/chocolate.jpg',
  categoryId: 'traditional'
}
```

## Formatos suportados:
- JPG
- PNG
- GIF
- WebP

## Tamanho recomendado:
- **Largura:** 300-500px
- **Altura:** 300-500px
- **Peso:** Máximo 500KB por imagem
